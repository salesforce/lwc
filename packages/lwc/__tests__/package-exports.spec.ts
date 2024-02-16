/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('packaged dependencies are re-exported', () => {
    const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));
    test.each(Object.keys(pkg.dependencies))(`%s is exported`, (name) => {
        const relative = name.replace('@lwc', '.');
        expect(pkg.exports[relative]).toBe(`${relative}.js`);
    });
});
