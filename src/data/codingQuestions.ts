export interface TestCase {
  name: string;
  input: any[];
  expected: any;
  explanation?: string;
}

export interface CodingQuestion {
  id: number;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  functionName: string;
  description: string;
  starterCode: string;
  solutionCode: string;
  solutionExplanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  testCases: TestCase[];
  constraints: string[];
  hints: string[];
}

export const CODING_QUESTIONS: CodingQuestion[] = [
  {
    id: 1,
    title: 'Array Intersection',
    category: 'Algorithms',
    difficulty: 'Easy',
    functionName: 'intersection',
    description: 'Write a function that takes two integer arrays nums1 and nums2, and returns an array of their unique intersection elements (elements that appear in both arrays).',
    starterCode: `function intersection(nums1, nums2) {
  // Write your code here
  
}`,
    solutionCode: `function intersection(nums1, nums2) {
  const set1 = new Set(nums1);
  return [...new Set(nums2.filter(x => set1.has(x)))];
}`,
    solutionExplanation: `1. Store all elements of nums1 in a Set for O(1) average lookup time.
2. Filter nums2 to only include items that exist in set1.
3. Wrap the filtered results in another Set and spread back into an array to ensure all elements are unique.`,
    timeComplexity: 'O(n + m) where n and m are the lengths of the two arrays',
    spaceComplexity: 'O(min(n, m)) to store unique elements in the Set',
    testCases: [
      { 
        input: [[1, 2, 2, 1], [2, 2]], 
        expected: [2], 
        name: 'Duplicates test',
        explanation: 'Only 2 is shared between both arrays.'
      },
      { 
        input: [[4, 9, 5], [9, 4, 9, 8, 4]], 
        expected: [9, 4], 
        name: 'Unordered elements',
        explanation: '4 and 9 appear in both arrays.'
      },
      { 
        input: [[1, 2, 3], [4, 5, 6]], 
        expected: [], 
        name: 'No intersection',
        explanation: 'No elements in common, should return an empty array.'
      }
    ],
    constraints: [
      '1 <= nums1.length, nums2.length <= 1000',
      '0 <= nums1[i], nums2[i] <= 1000',
      'Result elements must be unique'
    ],
    hints: [
      'Think about using a hash-based data structure like Set to look up values in O(1) time.',
      'How can you prevent duplicate elements from appearing in the final return array?'
    ]
  },
  {
    id: 2,
    title: 'Two Sum',
    category: 'Hash Maps',
    difficulty: 'Easy',
    functionName: 'twoSum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.',
    starterCode: `function twoSum(nums, target) {
  // Write your code here
  
}`,
    solutionCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    solutionExplanation: `1. Initialize a hash map (or Map) to store each number and its corresponding array index.
2. Iterate through nums. At each index i, compute complement = target - nums[i].
3. If complement is already in the map, return [map.get(complement), i].
4. Otherwise, store the current number nums[i] with index i in the map and continue.`,
    timeComplexity: 'O(n) with a single pass through the array',
    spaceComplexity: 'O(n) for the hash map storing up to n elements',
    testCases: [
      { 
        input: [[2, 7, 11, 15], 9], 
        expected: [0, 1], 
        name: 'Simple target 9',
        explanation: 'nums[0] + nums[1] = 2 + 7 = 9'
      },
      { 
        input: [[3, 2, 4], 6], 
        expected: [1, 2], 
        name: 'Target 6 with indices [1, 2]',
        explanation: 'nums[1] + nums[2] = 2 + 4 = 6'
      },
      { 
        input: [[3, 3], 6], 
        expected: [0, 1], 
        name: 'Duplicate numbers summing to target',
        explanation: 'nums[0] + nums[1] = 3 + 3 = 6'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      'Only one valid answer exists'
    ],
    hints: [
      'A brute force O(n^2) approach checks all pairs. Can you do it in O(n) using extra space?',
      'As you iterate, what number do you need to reach target? Can you check if you have seen it before?'
    ]
  },
  {
    id: 3,
    title: 'Valid Anagram',
    category: 'Strings',
    difficulty: 'Easy',
    functionName: 'isAnagram',
    description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise. An anagram is a word formed by rearranging the letters of a different word using all the original letters exactly once.',
    starterCode: `function isAnagram(s, t) {
  // Write your code here
  
}`,
    solutionCode: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const counts = {};
  for (const char of s) {
    counts[char] = (counts[char] || 0) + 1;
  }
  for (const char of t) {
    if (!counts[char]) return false;
    counts[char]--;
  }
  return true;
}`,
    solutionExplanation: `1. Check length: If s and t have different lengths, they cannot be anagrams.
2. Build a character frequency map for string s.
3. Iterate through string t: for each character, decrement its count in the frequency map. If a character is missing or has count 0, return false.
4. If all characters match, return true.`,
    timeComplexity: 'O(n) where n is the length of the string',
    spaceComplexity: 'O(1) since the alphabet has a fixed size (26 lowercase English letters)',
    testCases: [
      { 
        input: ['anagram', 'nagaram'], 
        expected: true, 
        name: 'True anagram',
        explanation: 'Both words contain the exact same letters and counts.'
      },
      { 
        input: ['rat', 'car'], 
        expected: false, 
        name: 'Not an anagram',
        explanation: 'The letter c in car does not appear in rat.'
      },
      { 
        input: ['listen', 'silent'], 
        expected: true, 
        name: 'Classical anagram pair',
        explanation: 'All letters match in frequency.'
      }
    ],
    constraints: [
      '1 <= s.length, t.length <= 5 * 10^4',
      's and t consist of lowercase English letters'
    ],
    hints: [
      'If the lengths of s and t are different, what can you deduce immediately?',
      'Can you count occurrences of each letter rather than sorting the characters?'
    ]
  },
  {
    id: 4,
    title: 'Flatten Array',
    category: 'Recursion',
    difficulty: 'Medium',
    functionName: 'flatten',
    description: 'Write a function flatten that takes an arbitrarily deeply nested array and returns a flat 1D array preserving the original element order.',
    starterCode: `function flatten(arr) {
  // Write your code here
  
}`,
    solutionCode: `function flatten(arr) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}`,
    solutionExplanation: `1. Initialize an empty result array.
2. Loop through each item in arr.
3. If the item is an array (Array.isArray), recursively call flatten(item) and spread the flattened items into result.
4. If the item is not an array, push it directly into result.
5. Return the accumulated 1D result array.`,
    timeComplexity: 'O(N) where N is the total number of elements including nested arrays',
    spaceComplexity: 'O(D) call stack space where D is the maximum depth of nesting',
    testCases: [
      { 
        input: [[[1, [2, [3, [4]]]]]], 
        expected: [1, 2, 3, 4], 
        name: 'Deep nesting',
        explanation: 'Unravels 4 levels of nested arrays into [1, 2, 3, 4].'
      },
      { 
        input: [[1, 2, [3, 4], 5]], 
        expected: [1, 2, 3, 4, 5], 
        name: 'Mixed flat & nested items',
        explanation: 'Flattens internal sub-array while keeping outer elements intact.'
      },
      { 
        input: [[[], [[]], 1, [2]]], 
        expected: [1, 2], 
        name: 'Empty nested arrays',
        explanation: 'Empty nested brackets produce no elements in the flattened output.'
      }
    ],
    constraints: [
      'Input can have arbitrary nesting depth',
      'Original element order must be strictly preserved'
    ],
    hints: [
      'How can you check if an item is an array? (Hint: Array.isArray)',
      'Consider recursion: if an element is an array, flatten that element!'
    ]
  },
  {
    id: 5,
    title: 'Debounce Function',
    category: 'JavaScript & Closures',
    difficulty: 'Medium',
    functionName: 'debounce',
    description: 'Implement a debounce function that delays invoking the passed function until after delay milliseconds have elapsed since the last time the debounced function was invoked.',
    starterCode: `function debounce(fn, delay) {
  // Write your code here
  
}`,
    solutionCode: `function debounce(fn, delay) {
  let timerId = null;
  return function(...args) {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}`,
    solutionExplanation: `1. Maintain a closure variable timerId to track the active timer.
2. Return a new wrapper function that accepts any arguments (...args).
3. When called, cancel any existing timer using clearTimeout(timerId).
4. Start a new timer with setTimeout to execute fn with the original arguments after delay milliseconds.`,
    timeComplexity: 'O(1) execution overhead per function call',
    spaceComplexity: 'O(1) persistent closure memory',
    testCases: [
      { 
        input: ['test_debounce', 50], 
        expected: true, 
        name: 'Debounce timing test',
        explanation: 'Calls are coalesced and only the final invocation fires after the delay window.'
      }
    ],
    constraints: [
      'delay is a non-negative integer in milliseconds',
      'Function must preserve execution context and argument values'
    ],
    hints: [
      'Use a closure to hold the timer reference across multiple invocations.',
      'Remember to cancel any existing pending timer before creating a new one.'
    ]
  }
];
