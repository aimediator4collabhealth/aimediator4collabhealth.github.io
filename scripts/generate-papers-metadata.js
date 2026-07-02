import fs from 'fs';
import path from 'path';

const PAPERS_DIR = './public/papers';
const CUSTOM_JSON_PATH = './public/papers-custom.json';
const OUTPUT_JSON_PATH = './public/papers-metadata.json';

// Helper to decode UTF-16BE bytes
function decodeUtf16BE(buffer) {
  if (buffer.length < 2) return '';
  const swapped = Buffer.alloc(buffer.length);
  for (let i = 0; i < buffer.length - 1; i += 2) {
    swapped[i] = buffer[i+1];
    swapped[i+1] = buffer[i];
  }
  let start = 0;
  if (swapped[0] === 0xFF && swapped[1] === 0xFE) {
    start = 2;
  }
  return swapped.toString('utf16le', start);
}

// Decode PDF strings (literal and hex)
function decodePdfString(str) {
  if (str.startsWith('<') && str.endsWith('>')) {
    let hex = str.slice(1, -1).replace(/\s+/g, '');
    if (hex.length % 2 !== 0) {
      hex += '0';
    }
    const buffer = Buffer.from(hex, 'hex');
    
    // Check for UTF-16BE BOM (0xFE 0xFF)
    if (buffer.length >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
      return decodeUtf16BE(buffer);
    }
    return buffer.toString('utf-8');
  }
  
  if (str.startsWith('(') && str.endsWith(')')) {
    let content = str.slice(1, -1);
    
    // Check if it's UTF-16BE literal string (starts with \xfe\xff)
    if (content.startsWith('\xfe\xff') || content.startsWith('\u00fe\u00ff')) {
      const buffer = Buffer.from(content, 'binary');
      return decodeUtf16BE(buffer);
    }
    
    // Unescape standard sequences
    content = content.replace(/\\(.)/g, (m, char) => {
      if (char === 'n') return '\n';
      if (char === 'r') return '\r';
      if (char === 't') return '\t';
      if (char === 'b') return '\b';
      if (char === 'f') return '\f';
      return char;
    });
    
    return content;
  }
  
  return str;
}

// Prettify filename as title fallback
function prettifyFilename(filename) {
  const base = path.parse(filename).name;
  return base
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

// Try to extract title from PDF file content
function extractTitleFromPdf(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    const text = data.toString('binary');
    
    // Match /Title metadata
    const titleRegex = /\/Title\s*(<[a-fA-F0-9\s]+>|\([^)]+\))/;
    const match = text.match(titleRegex);
    if (match) {
      const decoded = decodePdfString(match[1]);
      if (decoded && decoded.trim()) {
        return decoded.trim();
      }
    }
  } catch (err) {
    console.error(`Warning: Failed to extract metadata from ${filePath}:`, err.message);
  }
  return null;
}

function main() {
  console.log('🔍 Scanning papers directory...');
  
  if (!fs.existsSync(PAPERS_DIR)) {
    console.log(`Creating papers directory: ${PAPERS_DIR}`);
    fs.mkdirSync(PAPERS_DIR, { recursive: true });
  }

  // Load custom metadata overrides if any
  let customMetadata = {};
  if (fs.existsSync(CUSTOM_JSON_PATH)) {
    try {
      const customContent = fs.readFileSync(CUSTOM_JSON_PATH, 'utf-8');
      customMetadata = JSON.parse(customContent);
      console.log('Loaded custom overrides from papers-custom.json');
    } catch (err) {
      console.error('Error parsing papers-custom.json:', err.message);
    }
  }

  const files = fs.readdirSync(PAPERS_DIR);
  const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
  console.log(`Found ${pdfFiles.length} PDF file(s) in ${PAPERS_DIR}`);

  const papers = pdfFiles.map(filename => {
    const filePath = path.join(PAPERS_DIR, filename);
    const custom = customMetadata[filename] || {};
    
    // 1. Get title (custom override -> auto extracted -> prettified filename)
    let title = custom.title;
    if (!title) {
      title = extractTitleFromPdf(filePath);
    }
    if (!title) {
      title = prettifyFilename(filename);
    }

    // 2. Get authors & affiliations (custom override -> empty)
    const authors = custom.authors || '';
    const affiliations = custom.affiliations || '';

    return {
      filename,
      url: `papers/${filename}`, // relative to root of site (since papers/ is in public/)
      title,
      authors,
      affiliations
    };
  });

  // Write metadata JSON output
  try {
    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(papers, null, 2), 'utf-8');
    console.log(`🎉 Successfully wrote metadata for ${papers.length} paper(s) to ${OUTPUT_JSON_PATH}`);
  } catch (err) {
    console.error('Error writing metadata output:', err.message);
  }
}

main();
