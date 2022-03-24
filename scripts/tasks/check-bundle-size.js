/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const { promisify } = require('util');
const zlib = require('zlib');
const terser = require('terser');
const bytes = require('bytes');
const { readFile } = require('fs/promises');

const bundleSizeLimits = {
    'engine-dom/iife/es2017/engine-dom.js': '16.62KB',
    'synthetic-shadow/iife/es2017/synthetic-shadow.js': '12.53KB',
    'wire-service/iife/es2017/wire-service.js': '1.07KB',
};

// Basic script to check bundle sizes and ensure that the minified+gzip prod versions of the files are under some limit
async function main() {
    let error = false;
    await Promise.all(
        Object.entries(bundleSizeLimits).map(async ([filepath, limit]) => {
            const code = await readFile(
                path.resolve(__dirname, '../../packages/lwc/dist', filepath),
                'utf8'
            );
            const prodCode = code.replace(/process.env.NODE_ENV/g, '"production"');
            const { code: minified } = await terser.minify(prodCode);
            const gzipped = await promisify(zlib.gzip)(Buffer.from(minified, 'utf8'), { level: 9 });
            const limitInBytes = bytes.parse(limit);
            const passed = gzipped.length <= limitInBytes;

            console.log(
                `
${passed ? 'PASSED: ' : 'FAILED: '}${filepath}
  Actual: ${bytes.format(gzipped.length)}
  Limit : ${limit}`.trim()
            );

            if (!passed) {
                error = true;
            }
        })
    );
    if (error) {
        process.exit(1);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
