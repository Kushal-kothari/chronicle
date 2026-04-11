/**
 * Generates Chronicle PNG icons using only Node.js built-ins.
 * Icon design: Blue background (#0A84FF) with a white "C" letterform.
 * Run: node scripts/generate-icons.mjs
 */
import { deflateSync } from 'zlib';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// CRC32 for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(data.length);
  const crcVal = Buffer.allocUnsafe(4);
  crcVal.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcVal]);
}

/**
 * Draw a Chronicle icon at a given size.
 * Design:
 *   - Background: #0A84FF (Apple blue)
 *   - Two white rectangles forming a stylized "C" / bar chart:
 *       left bar: full height center column
 *       right top + right bottom rectangles (gap in middle = the "C" opening)
 */
function makeChronicleIcon(size) {
  // RGBA pixel buffer
  const pixels = new Uint8Array(size * size * 4);

  const BG = [10, 132, 255, 255];     // #0A84FF
  const FG = [255, 255, 255, 255];    // white
  const FG2 = [255, 255, 255, 178];   // white 70%

  // Fill background
  for (let i = 0; i < size * size; i++) {
    pixels[i * 4 + 0] = BG[0];
    pixels[i * 4 + 1] = BG[1];
    pixels[i * 4 + 2] = BG[2];
    pixels[i * 4 + 3] = BG[3];
  }

  function setRect(x, y, w, h, color) {
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        if (px < 0 || py < 0 || px >= size || py >= size) continue;
        const i = (py * size + px) * 4;
        pixels[i + 0] = color[0];
        pixels[i + 1] = color[1];
        pixels[i + 2] = color[2];
        pixels[i + 3] = color[3];
      }
    }
  }

  // Proportional margins: 25% inset, rounded feel
  const m = Math.round(size * 0.25);    // margin
  const inner = size - m * 2;           // inner area

  const colW = Math.max(2, Math.round(inner * 0.38));  // bar width
  const gap = Math.max(1, Math.round(inner * 0.18));   // gap between bars
  const blockH = Math.max(2, Math.round(inner * 0.38)); // top/bottom block height

  // Left bar (full height) — FG
  setRect(m, m, colW, inner, FG);

  // Right top block — FG2 (dimmed)
  const rightX = m + colW + gap;
  const rightW = inner - colW - gap;
  setRect(rightX, m, rightW, blockH, FG2);

  // Right bottom block — FG
  setRect(rightX, m + inner - blockH, rightW, blockH, FG);

  // Build PNG: RGBA -> use color type 6
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.allocUnsafe(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData.writeUInt8(8, 8);   // bit depth
  ihdrData.writeUInt8(6, 9);   // color type: RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  // Filter byte (0 = None) + raw scanlines
  const raw = Buffer.allocUnsafe(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 4)] = 0;
    for (let x = 0; x < size; x++) {
      const srcOff = (y * size + x) * 4;
      const dstOff = y * (1 + size * 4) + 1 + x * 4;
      raw[dstOff + 0] = pixels[srcOff + 0];
      raw[dstOff + 1] = pixels[srcOff + 1];
      raw[dstOff + 2] = pixels[srcOff + 2];
      raw[dstOff + 3] = pixels[srcOff + 3];
    }
  }

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdrData),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of [16, 32, 48, 128]) {
  const png = makeChronicleIcon(size);
  // Write to both locations Chrome reads from
  const iconPath = resolve(__dirname, '..', 'src', 'assets', 'icons', `${size}x${size}.png`);
  const publicPath = resolve(__dirname, '..', 'public', `${size}x${size}.png`);
  writeFileSync(iconPath, png);
  writeFileSync(publicPath, png);
  console.log(`✓ ${size}x${size}.png`);
}

console.log('\nChronicle icons generated in src/assets/icons/ and public/');
