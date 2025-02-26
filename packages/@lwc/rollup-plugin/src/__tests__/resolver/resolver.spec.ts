/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'node:path';
import fs from 'node:fs';
import { describe, it, expect } from 'vitest';
import { rollup, type RollupLog, type Plugin, type RollupBuild } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';

import lwc, { type RollupLwcOptions } from '../../index';

const fixturesdir = path.resolve(__dirname, 'fixtures');

async function runRollup(
    pathname: string,
    {
        plugins = [] as Plugin[],
        external = ['lwc', '@lwc/synthetic-shadow', '@lwc/wire-service'],
        options = undefined as RollupLwcOptions | undefined,
    } = {}
): Promise<{ bundle: RollupBuild; warnings: RollupLog[] }> {
    const warnings: RollupLog[] = [];

    const bundle = await rollup({
        input: path.resolve(fixturesdir, pathname),
        plugins: [lwc(options), ...plugins],
        external,
        onwarn(warning) {
            warnings.push(warning);
        },
    });

    return {
        bundle,
        warnings,
    };
}

describe('resolver', () => {
    it('should be capable to resolve all the base LWC module imports', async () => {
        const { warnings } = await runRollup('lwc-modules/lwc-modules.js', { external: [] });
        expect(warnings).toHaveLength(0);
    });

    it('should use lwc.config.json to resolve LWC modules', async () => {
        const { bundle } = await runRollup('lwc-config-json/src/index.js');

        const result = await bundle.generate({
            format: 'esm',
        });

        const { code } = result.output[0];
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

    it('should properly resolve modules with @rollup/rollup-node-resolve and third-party package', async () => {
        const { warnings } = await runRollup('third-party-import/src/main.js', {
            plugins: [nodeResolve()],
        });

        expect(warnings).toHaveLength(0);
    });

    it('should properly handle non-component class', async () => {
        const { warnings, bundle } = await runRollup('non-component-class/src/main.js');
        const { output } = await bundle.generate({
            format: 'esm',
        });

        expect(warnings).toHaveLength(0);
        expect(output[0].code).toContain(`class NotALightningElement {}`);
        expect(output[0].code.replace(/\s/g, '')).toContain(
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
        const { warnings } = await runRollup('scoped-styles/src/main.js', {
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
        });

        expect(warnings).toHaveLength(0);
    });

    it('should emit a warning when import stylesheet file is missing', async () => {
        const { warnings, bundle } = await runRollup('missing-css/missing-css.js');

        const { output } = await bundle.generate({
            format: 'esm',
        });

        expect(warnings).toHaveLength(1);
        expect(warnings[0].message).toMatch(
            /The imported CSS file .+\/stylesheet.css does not exist: Importing it as undefined./
        );
        expect(output[0].code).toContain('var stylesheet = undefined;');
    });

    it('should resolve the namespace and name to the alias value', async () => {
        const { bundle } = await runRollup('namespace/src/index.js');

        const result = await bundle.generate({
            format: 'esm',
        });

        const { code } = result.output[0];
        // Alias name
        expect(code).toContain(`sel: "alias-bar"`);
        // Original name
        expect(code).not.toContain(`sel: "x-foo"`);
    });

    it('should use directory to resolve the namespace and name for invalid alias specifier', async () => {
        const { bundle } = await runRollup('namespace/src/invalid.js');

        const result = await bundle.generate({
            format: 'esm',
        });

        const { code } = result.output[0];

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
        const { bundle } = await runRollup('inherited-templates/src/javascript.js');

        const result = await bundle.generate({
            format: 'esm',
        });
        const { code } = result.output[0];

        expect(code).toContain('all your base');
    });

    it('should resolve inherited template for TypeScript component [#4233]', async () => {
        const { bundle } = await runRollup('inherited-templates/src/typescript.ts');

        const result = await bundle.generate({
            format: 'esm',
        });

        const { code } = result.output[0];

        expect(code).toContain('all your base');
    });
});
