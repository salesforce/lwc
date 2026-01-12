/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, beforeAll, test, expect } from 'vitest';

const PACKAGE_ROOT = path.join(import.meta.dirname, '..');

function readPackageFile(pkgName: string, ext: string) {
    const filename = path.join(PACKAGE_ROOT, pkgName + ext);
    const contents = fs.readFileSync(filename, 'utf8');
    return contents;
}

beforeAll(() => {
    // vitest jsdom does not install this legacy API by default, but @lwc/synthetic-shadow needs it
    globalThis.HTMLDocument = globalThis.Document;
});

describe('default exports are not forgotten', () => {
    const allFiles = fs.readdirSync(PACKAGE_ROOT);
    const packages = allFiles
        .filter((f) => f.endsWith('.js') && f !== 'index.js' && f !== 'vitest.config.js')
        .map((f) => f.slice(0, -3));
    test.each(packages)('@lwc/%s', async (pkg) => {
        const pathToEsmDistFile = path.join(
            PACKAGE_ROOT,
            '../../packages/@lwc',
            pkg,
            'dist/index.js'
        );
        const realModule = await import(pathToEsmDistFile);
        // Vitest messes with modules. In regular node, `aliasedModule.default`
        // and `realModule.default` are the same, but in vitest they're not :\
        // Checking `.default` at runtime would be ideal, but as a workaround
        // we check for "export { default }" in the alias file.
        // const aliasedModule = await import(`lwc/${pkg}`);
        // expect(aliasedModule.default).toBe(realModule.default);
        if ('default' in realModule) {
            const exportDefaultFromPackage = new RegExp(
                `^export \\{ default \\} from '@lwc/${pkg}';$`,
                'm'
            );
            // eslint-disable-next-line vitest/no-conditional-expect
            expect(readPackageFile(pkg, '.d.ts')).toMatch(exportDefaultFromPackage);
            // eslint-disable-next-line vitest/no-conditional-expect
            expect(readPackageFile(pkg, '.js')).toMatch(exportDefaultFromPackage);
        }
    });
});
