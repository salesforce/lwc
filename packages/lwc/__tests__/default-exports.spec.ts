/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const PACKAGE_ROOT = path.join(__dirname, '..');

const expectExportDefaultFromPackageInFile = (pkgName: string, ext: string) => {
    const filename = path.join(PACKAGE_ROOT, pkgName + ext);
    const contents = fs.readFileSync(filename, 'utf8');
    const exportDefaultFromPackage = new RegExp(
        `^export \\{ default \\} from '@lwc/${pkgName}';$`,
        'm'
    );
    expect(contents).toMatch(exportDefaultFromPackage);
};

describe('default exports are not forgotten', () => {
    const allFiles = fs.readdirSync(PACKAGE_ROOT);
    const packages = allFiles
        .filter((f) => f.endsWith('.js') && f !== 'index.js')
        .map((f) => f.slice(0, -3));
    test.each(packages)('@lwc/%s', async (pkg) => {
        const realModule = await import(`@lwc/${pkg}`);
        // When jest properly supports ESM, this will be a lot simpler
        // const aliasedModule = await import(`lwc/${pkg}`);
        // expect(aliasedModule.default).toBe(realModule.default);
        if (realModule.default) {
            expectExportDefaultFromPackageInFile(pkg, '.d.ts');
            expectExportDefaultFromPackageInFile(pkg, '.js');
        }
    });
});
