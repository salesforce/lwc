/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/// <reference types="vite/client" />
/**
 * @vitest-environment jsdom
 */
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { describe, test, vi } from 'vitest';
import type Module from 'node:module';

const PACKAGE_ROOT = path.join(__dirname, '..');

async function readPackageFile(pkgName: string, ext: string) {
    const filename = path.join(PACKAGE_ROOT, pkgName + ext);
    return await fs.readFile(filename, 'utf8');
}
/*
 * This comment needs to be updated:
 * Jest uses CommonJS, which means that packages with no explicit export statements actually export
 * the default `module.exports` empty object. That export is an empty object with the prototype set
 * to an empty object with null prototype.
 */
const hasExplicitDefaultExport = (mod: Module) => {
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

// vitest jsdom does not install this legacy API by default, but @lwc/synthetic-shadow needs it
vi.stubGlobal('HTMLDocument', globalThis.Document);

// @ts-expect-error import.meta
const packages = Object.entries(
    import.meta.glob<Module>(['../*.js', '!**/index.js', '!**/vitest.config.js'])
).map(([file, mod]) => [path.basename(file, '.js'), mod] as const);

describe('default exports are not forgotten', () => {
    test.for(packages)('@lwc/%s', { concurrent: true }, async ([pkg, mod], { expect }) => {
        const realModule = await mod();
        // The commend below needs to be updated:
        // When jest properly supports ESM, this will be a lot simpler
        // const aliasedModule = await import(`lwc/${pkg}`);
        // expect(aliasedModule.default).toBe(realModule.default);
        if (hasExplicitDefaultExport(realModule)) {
            const exportDefaultFromPackage = new RegExp(
                `^export \\{ default \\} from '@lwc/${pkg}';$`,
                'm'
            );
            await Promise.all([
                expect(readPackageFile(pkg, '.d.ts')).resolves.toMatch(exportDefaultFromPackage),
                expect(readPackageFile(pkg, '.js')).resolves.toMatch(exportDefaultFromPackage),
            ]);
        }
    });
});
