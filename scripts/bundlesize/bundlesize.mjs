/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Simple script to check our bundlesize
import fs from 'node:fs/promises';
import { promisify } from 'node:util';
import { gzip as gzipCallback } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import bytes from 'bytes';
import * as terser from 'terser';

const gzip = promisify(gzipCallback);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonFile = path.join(__dirname, 'bundlesize.config.json');
const { files } = JSON.parse(await fs.readFile(jsonFile, 'utf-8'));

let failed = false;

for (const { path: filePath, maxSize } of files) {
    const absoluteFile = path.join(__dirname, '../..', filePath);
    const unminifiedSource = await fs.readFile(absoluteFile, 'utf-8');
    const prodSource = unminifiedSource.replaceAll('process.env.NODE_ENV', '"production"');
    const { code: minifiedSource } = await terser.minify(prodSource, {
        mangle: true,
        compress: true,
        toplevel: true,
    });

    const bufferGzipped = await gzip(Buffer.from(minifiedSource, 'utf-8'), { level: 9 });

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
