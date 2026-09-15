import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // color type: RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with rounded rect icon & symbol
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;

  for (let y = 0; y < height; y++) {
    rawData.writeUInt8(0, offset++); // filter type 0 for each scanline

    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;

      // Rounded square background (emerald green #10b981 -> r: 16, g: 185, b: 129)
      const inBox = Math.abs(dx) < radius && Math.abs(dy) < radius;
      const inCorner =
        Math.abs(dx) > radius - (width * 0.1) &&
        Math.abs(dy) > radius - (width * 0.1) &&
        Math.hypot(Math.abs(dx) - (radius - width * 0.1), Math.abs(dy) - (radius - width * 0.1)) > width * 0.1;

      if (inBox && !inCorner) {
        // Draw white wallet / card glyph in center
        const inCard =
          Math.abs(dx) < width * 0.24 &&
          Math.abs(dy) < height * 0.16;

        const inCardNotch =
          dx > width * 0.08 &&
          dx < width * 0.24 &&
          Math.abs(dy) < height * 0.06;

        if (inCard && !inCardNotch) {
          // White symbol
          rawData.writeUInt8(255, offset++);
          rawData.writeUInt8(255, offset++);
          rawData.writeUInt8(255, offset++);
          rawData.writeUInt8(255, offset++);
        } else if (inCardNotch && Math.hypot(dx - width * 0.16, dy) < width * 0.035) {
          // Green lock/button inside notch
          rawData.writeUInt8(16, offset++);
          rawData.writeUInt8(185, offset++);
          rawData.writeUInt8(129, offset++);
          rawData.writeUInt8(255, offset++);
        } else {
          // Emerald Green background
          rawData.writeUInt8(16, offset++);
          rawData.writeUInt8(185, offset++);
          rawData.writeUInt8(129, offset++);
          rawData.writeUInt8(255, offset++);
        }
      } else {
        // Transparent
        rawData.writeUInt8(0, offset++);
        rawData.writeUInt8(0, offset++);
        rawData.writeUInt8(0, offset++);
        rawData.writeUInt8(0, offset++);
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);

  return Buffer.concat([len, body, crc]);
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(64, 64));

console.log('✅ Generated valid PNG icons for PWA in public/ directory!');
