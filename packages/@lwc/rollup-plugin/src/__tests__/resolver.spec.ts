/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'node:path';
import fs from 'node:fs';
import { describe, it, expect } from 'vitest';
import nodeResolve from '@rollup/plugin-node-resolve';
import { runRollup } from './util';

describe('resolver', () => {
    it('should be capable to resolve all the base LWC module imports without @rollup/plugin-node-resolve', async () => {
        const { warnings } = await runRollup('lwc-modules/lwc-modules.js', {}, { external: [] });
        expect(warnings).toHaveLength(0);
    });

    it('should be capable to resolve all the base LWC modules using @rollup/plugin-node-resolve', async () => {
        const { warnings } = await runRollup(
            'lwc-modules/lwc-modules.js',
            { defaultModules: [] },
            {
                external: [],
                plugins: [nodeResolve()],
            }
        );
        expect(warnings).toHaveLength(0);
    });

    it('should use lwc.config.json to resolve LWC modules', async () => {
        const { code } = await runRollup('lwc-config-json/src/index.js');

        expect(code).toContain('"button:v1');
        expect(code).toContain('"button:v2');
    });

    it('should properly resolve LWC module with implicit template', async () => {
        const { warnings } = await runRollup('implicit-html/implicit-html.js');

        expect(warnings).toHaveLength(0);
    });

    it('should properly resolve LWC module with implicit stylesheet', async () => {
        const { warnings } = await runRollup('implicit-css/implicit-css.js');

        expect(warnings).toHaveLength(0);
    });

    it("should ignore module that can't be resolved by LWC module resolver", async () => {
        const { warnings } = await runRollup('unknown-module/unknown-module.js');

        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toMatchObject({
            code: 'UNRESOLVED_IMPORT',
        });
    });

    it('should properly resolve modules with @rollup/plugin-node-resolve and third-party package', async () => {
        const { warnings } = await runRollup(
            'third-party-import/src/main.js',
            {},
            {
                plugins: [nodeResolve()],
            }
        );

        expect(warnings).toHaveLength(0);
    });

    it('should properly handle non-component class', async () => {
        const { warnings, code } = await runRollup('non-component-class/src/main.js');
        expect(warnings).toHaveLength(0);
        expect(code).toContain(`class NotALightningElement {}`);
        expect(code.replace(/\s/g, '')).toContain(
            `
            class AlsoNotALightningElement {
                constructor() {
                    this.foo = 'bar';
                }
            }
        `.replace(/\s/g, '')
        );
    });

    it('should properly resolve scoped styles with another plugin', async () => {
        const { warnings } = await runRollup(
            'scoped-styles/src/main.js',
            {},
            {
                plugins: [
                    {
                        name: 'resolve-scoped-styles',
                        resolveId(importee, importer) {
                            if (importee.endsWith('?scoped=true') && importer) {
                                const importeeWithoutQuery = importee.replace('?scoped=true', '');
                                const importerDir = path.dirname(importer);
                                const fullImportee = path.resolve(importerDir, importee);
                                const fullImporteeWithoutQuery = path.resolve(
                                    importerDir,
                                    importeeWithoutQuery
                                );
                                if (fs.existsSync(fullImporteeWithoutQuery)) {
                                    // mimics @rollup/plugin-node-resolve, which can resolve the ID with the query param
                                    return fullImportee;
                                }
                            }
                        },
                    },
                ],
            }
        );

        expect(warnings).toHaveLength(0);
    });

    it('should emit a warning when import stylesheet file is missing', async () => {
        const { warnings, code } = await runRollup('missing-css/missing-css.js');

        expect(warnings).toHaveLength(1);
        expect(warnings[0].message).toMatch(
            /The imported CSS file .+\/stylesheet.css does not exist: Importing it as undefined./
        );
        expect(code).toContain('var stylesheet = undefined;');
    });

    it('should resolve the namespace and name to the alias value', async () => {
        const { code } = await runRollup('namespace/src/index.js');

        // Alias name
        expect(code).toContain(`sel: "alias-bar"`);
        // Original name
        expect(code).not.toContain(`sel: "x-foo"`);
    });

    it('should use directory to resolve the namespace and name for invalid alias specifier', async () => {
        const { code } = await runRollup('namespace/src/invalid.js');
        // The alias name must be in the format namespace / name.
        // Otherwise, the folder structure is used to determine the namespace / name.

        // Folder name - no slash
        expect(code).toContain(`sel: "x-zoo"`);
        // Alias name
        expect(code).not.toContain(`sel: "zoo"`);

        // Folder name - trailing slash
        expect(code).toContain(`sel: "x-baz"`);
        // Alias name
        expect(code).not.toContain(`sel: "baz"`);

        // Folder name - multiple slashes
        expect(code).toContain(`sel: "x-quux"`);
        // Alias name
        expect(code).not.toContain(`sel: "foo-bar"`);
    });

    it('should resolve inherited template for JavaScript component [#4233]', async () => {
        const { code } = await runRollup('inherited-templates/src/javascript.js');
        expect(code).toContain('all your base');
    });

    it('should resolve inherited template for TypeScript component [#4233]', async () => {
        const { code } = await runRollup('inherited-templates/src/typescript.ts');
        expect(code).toContain('all your base');
    });
});
