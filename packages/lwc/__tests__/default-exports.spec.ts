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

/*
 * Jest uses CommonJS, which means that packages with no explicit export statements actually export
 * the default `module.exports` empty object. That export is an empty object with the prototype set
 * to an empty object with null prototype.
 */
const hasExplicitDefaultExport = (mod: object) => {
    // No default export = self explanatory
    if (!('default' in mod)) return false;
    // If we have more than one export, then we must have explicitly declared them
    if (Object.keys(mod).length > 1) return true;
    const def = mod.default;
    // If it's not an object, it must be an explicit export
    if (typeof def !== 'object' || def === null) return true;
    // If it's not an empty object, it's not the placeholder object
    if (Object.keys(def).length > 0) return true;
    const proto = Object.getPrototypeOf(def);
    // If the prototype isn't an empty null-prototype object, it's not the placeholder object
    if (Object.keys(proto).length > 0 || Object.getPrototypeOf(proto) !== null) return true;
    // It must be the placeholder object!
    return false;
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
        if (hasExplicitDefaultExport(realModule)) {
            expectExportDefaultFromPackageInFile(pkg, '.d.ts');
            expectExportDefaultFromPackageInFile(pkg, '.js');
        }
    });
});
