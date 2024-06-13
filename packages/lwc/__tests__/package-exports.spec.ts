/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Packages that only contain type definitions, no JavaScript. */
const tsPackages = ['@lwc/types'];

describe('packaged dependencies are re-exported', () => {
    const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));
    test.each(Object.keys(pkg.dependencies))(`%s is exported`, (name) => {
        const relative = name.replace('@lwc', '.');
        const ext = tsPackages.includes(name) ? '.d.ts' : '.js';
        expect(pkg.exports[relative]).toBe(relative + ext);
    });
});
