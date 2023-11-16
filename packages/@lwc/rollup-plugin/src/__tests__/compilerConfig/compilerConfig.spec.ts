/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'path';
import { rollup, RollupLog } from 'rollup';

import lwc from '../../index';

describe('templateConfig', () => {
    it('compile with preserveHtmlComments option', async () => {
        const bundle = await rollup({
            input: path.resolve(__dirname, 'fixtures/test/test.js'),
            plugins: [
                lwc({
                    preserveHtmlComments: true,
                }),
            ],
        });

        const { output } = await bundle.generate({
            format: 'esm',
        });

        expect(output[0].code).toContain('Application container');
    });

    it('should accept disableSyntheticShadowSupport config flag', async () => {
        const bundle = await rollup({
            input: path.resolve(__dirname, 'fixtures/test/test.js'),
            plugins: [
                lwc({
                    disableSyntheticShadowSupport: true,
                }),
            ],
        });

        const { output } = await bundle.generate({
            format: 'esm',
        });

        // This function takes no arguments, corresponding to the optimization used
        // for `disableSyntheticShadowSupport: true` by serialize.ts in @lwc/style-compiler
        expect(output[0].code).toContain('function stylesheet()');
    });

    it('should accept enableDynamicComponents config flag', async () => {
        const bundle = await rollup({
            input: path.resolve(__dirname, 'fixtures/dynamicComponent/dynamicComponent.js'),
            plugins: [
                lwc({
                    enableDynamicComponents: true,
                }),
            ],
        });

        const { output } = await bundle.generate({
            format: 'esm',
        });

        expect(output[0].code).toContain('api_dynamic_component');
    });

    it('should accept experimentalDynamicDirective config flag', async () => {
        const warnings: RollupLog[] = [];
        const bundle = await rollup({
            input: path.resolve(__dirname, 'fixtures/experimentalDynamic/experimentalDynamic.js'),
            plugins: [
                lwc({
                    experimentalDynamicDirective: true,
                }),
            ],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        const { output } = await bundle.generate({
            format: 'esm',
        });

        expect(warnings).toHaveLength(1);
        expect(warnings?.[0]?.message).toContain(
            'LWC1187: The lwc:dynamic directive is deprecated'
        );
        expect(output[0].code).toContain('api_deprecated_dynamic_component');
    });
});

describe('javaScriptConfig', () => {
    it('should accept experimentalDynamicComponent config flag', async () => {
        const CUSTOM_LOADER = '@salesforce/loader';
        const bundle = await rollup({
            input: path.resolve(__dirname, 'fixtures/dynamicImportConfig/dynamicImportConfig.js'),
            plugins: [
                lwc({
                    experimentalDynamicComponent: { loader: CUSTOM_LOADER, strictSpecifier: true },
                }),
            ],
            external: [CUSTOM_LOADER],
        });

        const { output } = await bundle.generate({
            format: 'esm',
        });

        expect(output[0].imports).toContain(CUSTOM_LOADER);
    });
});

describe('lwsConfig', () => {
    it('should accept enableLightningWebSecurityTransforms config flag', async () => {
        function stripWhitespace(string: string) {
            return string.replace(/\s/g, '');
        }

        const bundle = await rollup({
            input: path.resolve(
                __dirname,
                'fixtures/lightningWebSecurityTransforms/lightningWebSecurityTransforms.js'
            ),
            plugins: [
                lwc({
                    enableLightningWebSecurityTransforms: true,
                }),
            ],
        });

        const { output } = await bundle.generate({
            format: 'esm',
        });

        const { code } = output[0];

        expect(stripWhitespace(code)).toContain(
            stripWhitespace(
                '(window === globalThis || window === document ? location : window.location).href'
            )
        );
        expect(code).toContain('_asyncToGenerator');
        expect(code).toContain('_wrapAsyncGenerator');
        expect(code).toContain('_asyncIterator');
    });
});
