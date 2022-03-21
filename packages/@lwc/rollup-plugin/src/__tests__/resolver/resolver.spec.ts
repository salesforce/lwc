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
            source: 'some/module',
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

        await rollup({
            input: path.resolve(__dirname, 'fixtures/non-component-class/src/main.js'),
            plugins: [lwc()],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        expect(warnings).toHaveLength(0);
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
});
