import fs from 'node:fs';
import zlib from 'node:zlib';

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

export function createPng(size) {
  const width = size;
  const height = size;
  const scanlines = [];
  const radius = size * 0.22;
  const center = size / 2;

  for (let y = 0; y < height; y++) {
    const line = Buffer.alloc(1 + width * 4);
    line[0] = 0;
    for (let x = 0; x < width; x++) {
      const idx = 1 + x * 4;
      const qx = Math.abs(x - center) - (center - radius);
      const qy = Math.abs(y - center) - (center - radius);
      const dist = Math.sqrt(Math.max(0, qx) ** 2 + Math.max(0, qy) ** 2);
      const inBox = qx <= 0 || qy <= 0 || dist <= radius;

      if (!inBox) {
        line[idx] = 0;
        line[idx + 1] = 0;
        line[idx + 2] = 0;
        line[idx + 3] = 0;
        continue;
      }

      let r = 17, g = 17, b = 17, a = 255;
      const nx = (x / size) * 100;
      const ny = (y / size) * 100;

      const inStem = nx >= 30 && nx <= 42 && ny >= 25 && ny <= 75;
      const inTopBar = nx >= 30 && nx <= 60 && ny >= 25 && ny <= 37;
      const inBottomBar = nx >= 30 && nx <= 60 && ny >= 63 && ny <= 75;
      const cdx = nx - 55;
      const cdy = ny - 50;
      const cDist = Math.sqrt(cdx * cdx + cdy * cdy);
      const inOuterCurve = nx >= 55 && cDist <= 25;
      const inInnerHole = (nx >= 42 && nx <= 55 && ny >= 37 && ny <= 63) || (nx >= 53 && Math.sqrt((nx - 53)**2 + (ny - 50)**2) <= 13);

      if ((inStem || inTopBar || inBottomBar || inOuterCurve) && !inInnerHole) {
        r = 255;
        g = 255;
        b = 255;
      }

      const dotDist = Math.sqrt((nx - 72)**2 + (ny - 30)**2);
      if (dotDist <= 4) {
        r = 16;
        g = 185;
        b = 129;
      }

      line[idx] = r;
      line[idx + 1] = g;
      line[idx + 2] = b;
      line[idx + 3] = a;
    }
    scanlines.push(line);
  }

  const rawData = Buffer.concat(scanlines);
  const deflated = zlib.deflateSync(rawData);

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

if (process.argv[1]?.includes('generate_pwa_icons.js')) {
  fs.writeFileSync('public/icon-192.png', createPng(192));
  fs.writeFileSync('public/icon-512.png', createPng(512));
  console.log('PWA icons generated successfully.');
}
