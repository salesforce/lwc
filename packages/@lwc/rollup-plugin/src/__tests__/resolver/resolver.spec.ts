/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'path';
import fs from 'fs';
import { rollup } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';

import lwc from '../../index';

describe('resolver', () => {
    it('should be capable to resolve all the base LWC module imports', async () => {
        const warnings: any = [];

        await rollup({
            input: path.resolve(__dirname, 'fixtures/lwc-modules/lwc-modules.js'),
            plugins: [lwc()],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        expect(warnings).toHaveLength(0);
    });

    it('should use lwc.config.json to resolve LWC modules', async () => {
        const bundle = await rollup({
            input: path.resolve(__dirname, 'fixtures/lwc-config-json/src/index.js'),
            plugins: [lwc()],
        });

        const result = await bundle.generate({
            format: 'esm',
        });

        const { code } = result.output[0];
        expect(code).toContain('"button:v1');
        expect(code).toContain('"button:v2');
    });

    it('should properly resolve LWC module with implicit template', async () => {
        const warnings: any = [];

        await rollup({
            input: path.resolve(__dirname, 'fixtures/implicit-html/implicit-html.js'),
            plugins: [lwc()],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        expect(warnings).toHaveLength(0);
    });

    it('should properly resolve LWC module with implicit stylesheet', async () => {
        const warnings: any = [];

        await rollup({
            input: path.resolve(__dirname, 'fixtures/implicit-css/implicit-css.js'),
            plugins: [lwc()],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        expect(warnings).toHaveLength(0);
    });

    it("should ignore module that can't be resolved by LWC module resolver", async () => {
        const warnings: any = [];

        await rollup({
            input: path.resolve(__dirname, 'fixtures/unknown-module/unknown-module.js'),
            plugins: [lwc()],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toMatchObject({
            code: 'UNRESOLVED_IMPORT',
        });
    });

    it('should properly resolve modules with @rollup/rollup-node-resolve and third-party package', async () => {
        const warnings: any = [];

        await rollup({
            input: path.resolve(__dirname, 'fixtures/third-party-import/src/main.js'),
            plugins: [lwc(), nodeResolve()],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        expect(warnings).toHaveLength(0);
    });

    it('should properly handle non-component class', async () => {
        const warnings: any = [];

        const bundle = await rollup({
            input: path.resolve(__dirname, 'fixtures/non-component-class/src/main.js'),
            plugins: [lwc()],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

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
        const warnings: any = [];

        await rollup({
            input: path.resolve(__dirname, 'fixtures/scoped-styles/src/main.js'),
            plugins: [
                lwc(),
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
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        expect(warnings).toHaveLength(0);
    });

    it('should emit a warning when import stylesheet file is missing', async () => {
        const warnings: any = [];

        const bundle = await rollup({
            input: path.resolve(__dirname, 'fixtures/missing-css/missing-css.js'),
            plugins: [lwc()],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

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
        const bundle = await rollup({
            input: path.resolve(__dirname, 'fixtures/namespace/src/index.js'),
            plugins: [lwc()],
        });

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
        const bundle = await rollup({
            input: path.resolve(__dirname, 'fixtures/namespace/src/invalid.js'),
            plugins: [lwc()],
        });

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
});
