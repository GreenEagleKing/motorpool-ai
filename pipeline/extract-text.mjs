// Step 1: PDF -> plain text with page markers.
// Usage: node extract-text.mjs "<path-to-pdf>" --from 127 --to 137 --out ../sources/tm9-803/fuel-section.txt
//
// Why pdfjs-dist (not poppler/pdftotext): pure npm, works the same on
// Windows/Mac/Linux — no system install needed.

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}

const pdfPath = process.argv[2];
if (!pdfPath) {
  console.error('Usage: node extract-text.mjs <pdf> [--from N] [--to N] [--out file.txt]');
  process.exit(1);
}

const from = Number(arg('from', 1));
const outPath = arg('out', null);

const data = new Uint8Array(readFileSync(resolve(pdfPath)));
const doc = await getDocument({ data, verbosity: 0 }).promise;
const to = Number(arg('to', doc.numPages));

const pages = [];
for (let p = from; p <= to; p++) {
  const page = await doc.getPage(p);
  const content = await page.getTextContent();
  // Join items, inserting newlines when the y-position changes (rough line detection)
  let lastY = null;
  let text = '';
  for (const item of content.items) {
    const y = item.transform[5];
    if (lastY !== null && Math.abs(y - lastY) > 2) text += '\n';
    else if (text && !text.endsWith('\n')) text += ' ';
    text += item.str;
    lastY = y;
  }
  text = text.replace(/[ \t]{2,}/g, ' '); // pdfjs pads words with extra spaces
  pages.push(`=== PDF PAGE ${p} ===\n${text.trim()}`);
  process.stderr.write(`page ${p}/${to}\r`);
}

const output = pages.join('\n\n');
if (outPath) {
  mkdirSync(dirname(resolve(outPath)), { recursive: true });
  writeFileSync(resolve(outPath), output);
  console.error(`\nWrote ${pages.length} pages -> ${outPath}`);
} else {
  console.log(output);
}
