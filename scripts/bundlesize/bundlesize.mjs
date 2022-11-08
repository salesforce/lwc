// Simple script to check our bundlesize
import fs from 'fs/promises';
import { promisify } from 'util';
import { gzip as gzipCallback } from 'zlib';
import { fileURLToPath } from 'url';
import path from 'path';
import bytes from 'bytes';
import { minify } from 'terser';

const gzip = promisify(gzipCallback);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonFile = path.join(__dirname, 'bundlesize.config.json');
const { files } = JSON.parse(await fs.readFile(jsonFile, 'utf-8'));

let failed = false;

for (const { path: filePath, maxSize } of files) {
    const absoluteFile = path.join(__dirname, '../..', filePath);
    const source = await fs.readFile(absoluteFile, 'utf-8');
    const { code } = await minify(source, { compress: true, mangle: true });
    const bufferGzipped = await gzip(Buffer.from(code, 'utf-8'), { level: 9 });

    if (bufferGzipped.length > bytes.parse(maxSize)) {
        console.log(`FAIL: ${filePath}: ${bytes.format(bufferGzipped.length)} > ${maxSize}`);
        failed = true;
    } else {
        console.log(`PASS: ${filePath}: ${bytes.format(bufferGzipped.length)} <= ${maxSize}`);
    }
}

if (failed) {
    throw new Error('bundlesize check failed');
}
