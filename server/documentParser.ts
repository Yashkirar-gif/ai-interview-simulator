import mammoth from 'mammoth';

// Robust text extraction from uploaded resume documents (PDF, DOCX, TXT)
export async function extractTextFromDocument(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<{ text: string; wordCount: number; charCount: number; info?: string }> {
  const lowerName = fileName.toLowerCase();

  // 1. DOCX files
  if (lowerName.endsWith('.docx') || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = cleanExtractedText(result.value);
      if (text.length > 20) {
        return {
          text,
          wordCount: countWords(text),
          charCount: text.length,
          info: `Extracted from Word (.docx) document: ${fileName}`
        };
      }
    } catch (err) {
      console.warn('Mammoth docx extraction failed, trying plain fallback:', err);
    }
  }

  // 2. PDF files
  if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
    try {
      const pdfModule: any = await import('pdf-parse');
      const parseFn = typeof pdfModule === 'function' ? pdfModule : (pdfModule.default || pdfModule);
      const pdfData = await parseFn(buffer);
      const text = cleanExtractedText(pdfData.text || '');
      if (text.length > 20) {
        return {
          text,
          wordCount: countWords(text),
          charCount: text.length,
          info: `Extracted from PDF (${pdfData.numpages || 1} pages): ${fileName}`
        };
      }
    } catch (err) {
      console.warn('pdf-parse extraction failed, falling back to stream parsing:', err);
      // Fallback PDF text scraper for streams
      const fallbackText = extractTextFromPdfBuffer(buffer);
      if (fallbackText.length > 20) {
        return {
          text: fallbackText,
          wordCount: countWords(fallbackText),
          charCount: fallbackText.length,
          info: `Extracted from PDF: ${fileName}`
        };
      }
    }
  }

  // 3. Plain text / Markdown / HTML / RTF / generic text
  const rawString = buffer.toString('utf-8');
  const text = cleanExtractedText(rawString);
  return {
    text,
    wordCount: countWords(text),
    charCount: text.length,
    info: `Loaded text document: ${fileName}`
  };
}

function cleanExtractedText(raw: string): string {
  if (!raw) return '';
  return raw
    // Normalize newlines
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove control characters except standard whitespace
    .replace(/[^\x20-\x7E\t\n]/g, ' ')
    // Collapse excessive blank lines
    .replace(/\n{3,}/g, '\n\n')
    // Collapse excessive horizontal whitespace
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function countWords(str: string): number {
  return str.split(/\s+/).filter(Boolean).length;
}

// Low-level fallback if pdf-parse encounters unusual PDF streams
function extractTextFromPdfBuffer(buffer: Buffer): string {
  const content = buffer.toString('latin1');
  const textChunks: string[] = [];

  // Match text in parenthesis inside BT ... ET text blocks
  // e.g. (Some Text) Tj or [(Some) -20 (Text)] TJ
  const btEtRegex = /BT[\s\S]*?ET/g;
  let blockMatch: RegExpExecArray | null;

  while ((blockMatch = btEtRegex.exec(content)) !== null) {
    const block = blockMatch[0];
    const tjRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      const chunk = tjMatch[1].replace(/\\([()\\])/g, '$1').trim();
      if (chunk.length > 0) {
        textChunks.push(chunk);
      }
    }

    // Also match array-based TJ: [(Hello) 20 (World)] TJ
    const arrayTjRegex = /\[(.*?)\]\s*TJ/g;
    let arrayMatch: RegExpExecArray | null;
    while ((arrayMatch = arrayTjRegex.exec(block)) !== null) {
      const inner = arrayMatch[1];
      const partRegex = /\(([^)]+)\)/g;
      let partMatch: RegExpExecArray | null;
      while ((partMatch = partRegex.exec(inner)) !== null) {
        const chunk = partMatch[1].replace(/\\([()\\])/g, '$1').trim();
        if (chunk.length > 0) {
          textChunks.push(chunk);
        }
      }
    }
  }

  if (textChunks.length > 10) {
    return cleanExtractedText(textChunks.join(' '));
  }

  // Last-ditch string extraction: filter contiguous printable strings > 4 chars
  const strings = content.match(/[A-Za-z0-9,.:;@/\-()]{4,}/g) || [];
  return cleanExtractedText(strings.join(' '));
}
