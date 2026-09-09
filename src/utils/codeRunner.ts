export interface CodeError {
  type: 'syntax' | 'runtime' | 'assertion' | 'missing_function';
  line: number | null;
  column?: number | null;
  message: string;
  lineSnippet?: string;
  testCaseName?: string;
  suggestion?: string;
}

export interface TestResult {
  name: string;
  input: any[];
  expected: any;
  actual: any;
  passed: boolean;
  error?: string;
  errorLine?: number | null;
  explanation?: string;
}

export interface CodeExecutionResult {
  allPassed: boolean;
  results: TestResult[];
  error: CodeError | null;
}

/**
 * Pinpoints the exact line number of a syntax error in user code.
 */
export function findSyntaxErrorLine(code: string, err: any): { line: number; message: string; snippet: string } {
  const lines = code.split('\n');
  let foundLine: number | null = null;
  const msg = err?.message || 'Syntax error in JavaScript code';

  // 1. Direct line number property on error
  if (typeof err?.lineNumber === 'number' && err.lineNumber >= 1 && err.lineNumber <= lines.length) {
    foundLine = err.lineNumber;
  }

  // 2. Stack trace match: <anonymous>:line:col
  if (!foundLine && err?.stack) {
    const match = err.stack.match(/<anonymous>:(\d+):(\d+)/);
    if (match) {
      const lineNum = parseInt(match[1], 10);
      if (lineNum >= 1 && lineNum <= lines.length) {
        foundLine = lineNum;
      }
    }
  }

  // 3. Incremental syntax check to find the earliest breaking line
  if (!foundLine) {
    for (let i = 1; i <= lines.length; i++) {
      const slice = lines.slice(0, i).join('\n');
      const openBraces = (slice.match(/{/g) || []).length;
      const closeBraces = (slice.match(/}/g) || []).length;
      const needed = Math.max(0, openBraces - closeBraces);
      const padded = slice + '\n' + '}'.repeat(needed);
      try {
        new Function(padded);
      } catch (sliceErr: any) {
        const sMsg = sliceErr.message || '';
        if (
          !sMsg.includes('Unexpected end of input') &&
          !sMsg.includes('missing }') &&
          !sMsg.includes('Unterminated') &&
          !sMsg.includes("Unexpected token ')'")
        ) {
          foundLine = i;
          break;
        }
      }
    }
  }

  // 4. Fallback: Scan lines for common syntax pitfalls (unclosed string, trailing operators)
  if (!foundLine) {
    for (let i = 0; i < lines.length; i++) {
      const text = lines[i].trim();
      if (
        text.endsWith('.') ||
        text.endsWith('+') ||
        text.endsWith('-') ||
        text.endsWith('*') ||
        text.endsWith('=') ||
        text.endsWith('===')
      ) {
        foundLine = i + 1;
        break;
      }
    }
  }

  const finalLine = foundLine || 1;
  return {
    line: finalLine,
    message: msg,
    snippet: lines[finalLine - 1]?.trim() || ''
  };
}

/**
 * Extracts line number from runtime error stack trace
 */
export function findRuntimeErrorLine(err: any, code: string): { line: number | null; message: string; snippet: string } {
  const lines = code.split('\n');
  let foundLine: number | null = null;
  const msg = err?.message || 'Runtime execution error';

  if (err?.stack) {
    const matches = [...err.stack.matchAll(/<anonymous>:(\d+):(\d+)/g)];
    for (const m of matches) {
      const lineNum = parseInt(m[1], 10);
      if (lineNum >= 1 && lineNum <= lines.length) {
        foundLine = lineNum;
        break;
      }
    }
  }

  // Fallback: If stack doesn't contain it, search for the identifier in code
  if (!foundLine && err?.message) {
    const propMatch = err.message.match(/reading '([^']+)'/) || err.message.match(/(\w+) is not defined/);
    if (propMatch && propMatch[1]) {
      const identifier = propMatch[1];
      const matchIdx = lines.findIndex(l => l.includes(identifier));
      if (matchIdx !== -1) {
        foundLine = matchIdx + 1;
      }
    }
  }

  return {
    line: foundLine,
    message: msg,
    snippet: foundLine ? lines[foundLine - 1]?.trim() || '' : ''
  };
}

/**
 * Runs test cases against user code and produces rich diagnostics with line numbers.
 */
export async function executeCode(
  code: string,
  functionName: string,
  testCases: any[]
): Promise<CodeExecutionResult> {
  const lines = code.split('\n');

  // 1. Check for Syntax Errors
  try {
    new Function(code);
  } catch (synErr: any) {
    const errorInfo = findSyntaxErrorLine(code, synErr);
    return {
      allPassed: false,
      results: [],
      error: {
        type: 'syntax',
        line: errorInfo.line,
        message: `Syntax Error: ${errorInfo.message}`,
        lineSnippet: errorInfo.snippet,
        suggestion: 'Check for unclosed parentheses, quotes, or missing punctuation on this line.'
      }
    };
  }

  // 2. Extract Function Instance
  let userFn: any = null;
  try {
    userFn = eval(`(${code})`);
  } catch {
    // If wrapping in parens fails, execute in a function block
    try {
      userFn = new Function(`
        ${code};
        if (typeof ${functionName} === 'function') {
          return ${functionName};
        }
        return null;
      `)();
    } catch (evalErr: any) {
      const errLine = findRuntimeErrorLine(evalErr, code);
      return {
        allPassed: false,
        results: [],
        error: {
          type: 'runtime',
          line: errLine.line,
          message: `Evaluation Error: ${errLine.message}`,
          lineSnippet: errLine.snippet
        }
      };
    }
  }

  if (typeof userFn !== 'function') {
    return {
      allPassed: false,
      results: [],
      error: {
        type: 'missing_function',
        line: 1,
        message: `Function "${functionName}" was not found or is not a callable function.`,
        lineSnippet: lines[0]?.trim() || '',
        suggestion: `Please define your function as: function ${functionName}(...) { ... }`
      }
    };
  }

  // 3. Execute Each Test Case
  const results: TestResult[] = [];
  let firstError: CodeError | null = null;
  let allPassed = true;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    try {
      let result: any;

      // Special handling for async/debounce
      if (functionName === 'debounce') {
        let callCount = 0;
        const debounced = userFn(() => { callCount++; }, 40);
        if (typeof debounced !== 'function') {
          throw new Error('debounce must return a wrapper function');
        }
        debounced();
        debounced();
        debounced();
        // Wait for timeout
        await new Promise(res => setTimeout(res, 60));
        result = callCount === 1;
      } else {
        result = userFn(...tc.input);
      }

      // Comparison logic
      let passed = false;
      if (functionName === 'intersection' && Array.isArray(result) && Array.isArray(tc.expected)) {
        // Compare sorted arrays
        const sortedActual = [...result].sort((a, b) => a - b);
        const sortedExpected = [...tc.expected].sort((a, b) => a - b);
        passed = JSON.stringify(sortedActual) === JSON.stringify(sortedExpected);
      } else if (functionName === 'twoSum' && Array.isArray(result) && Array.isArray(tc.expected)) {
        // Either exact indices or values add up to target
        const [i1, i2] = result || [];
        const nums = tc.input[0];
        const target = tc.input[1];
        if (typeof i1 === 'number' && typeof i2 === 'number' && i1 !== i2 && nums) {
          passed = nums[i1] + nums[i2] === target;
        } else {
          passed = JSON.stringify(result) === JSON.stringify(tc.expected);
        }
      } else if (typeof tc.expected === 'boolean') {
        passed = result === tc.expected;
      } else {
        passed = JSON.stringify(result) === JSON.stringify(tc.expected);
      }

      if (!passed) {
        allPassed = false;
        // Determine line number of failure
        let lineOfFailure: number | null = null;
        let suggestion = '';

        if (result === undefined) {
          suggestion = 'Your function returned undefined. Make sure you have a return statement that returns the expected value.';
          // Locate return statement or end of function
          const returnIdx = lines.findIndex(l => /\breturn\b/.test(l));
          lineOfFailure = returnIdx !== -1 ? returnIdx + 1 : lines.length;
        } else {
          suggestion = `Expected ${JSON.stringify(tc.expected)}, but your code returned ${JSON.stringify(result)}.`;
          const returnIdx = lines.findIndex(l => /\breturn\b/.test(l));
          lineOfFailure = returnIdx !== -1 ? returnIdx + 1 : lines.length;
        }

        if (!firstError) {
          firstError = {
            type: 'assertion',
            line: lineOfFailure,
            message: `Test "${tc.name}" failed: Expected ${JSON.stringify(tc.expected)}, got ${JSON.stringify(result)}`,
            lineSnippet: lineOfFailure ? lines[lineOfFailure - 1]?.trim() : '',
            testCaseName: tc.name,
            suggestion
          };
        }

        results.push({
          name: tc.name,
          input: tc.input,
          expected: tc.expected,
          actual: result,
          passed: false,
          errorLine: lineOfFailure,
          explanation: tc.explanation
        });
      } else {
        results.push({
          name: tc.name,
          input: tc.input,
          expected: tc.expected,
          actual: result,
          passed: true,
          explanation: tc.explanation
        });
      }
    } catch (runErr: any) {
      allPassed = false;
      const runtimeError = findRuntimeErrorLine(runErr, code);

      if (!firstError) {
        firstError = {
          type: 'runtime',
          line: runtimeError.line,
          message: `${runErr.name || 'Runtime Error'}: ${runtimeError.message}`,
          lineSnippet: runtimeError.snippet,
          testCaseName: tc.name,
          suggestion: 'Check for undefined variables, incorrect array methods, or invalid properties.'
        };
      }

      results.push({
        name: tc.name,
        input: tc.input,
        expected: tc.expected,
        actual: 'Threw Error',
        passed: false,
        error: runtimeError.message,
        errorLine: runtimeError.line,
        explanation: tc.explanation
      });
    }
  }

  return {
    allPassed,
    results,
    error: firstError
  };
}
