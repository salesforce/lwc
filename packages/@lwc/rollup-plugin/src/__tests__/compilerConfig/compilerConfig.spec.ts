/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { rollup, type RollupLog, type RollupBuild } from 'rollup';

import lwc, { type RollupLwcOptions } from '../../index';

async function runRollup(
    pathname: string,
    options: RollupLwcOptions = {},
    { external = [] as string[] } = {}
): Promise<{ bundle: RollupBuild; warnings: RollupLog[] }> {
    const warnings: RollupLog[] = [];

    const bundle = await rollup({
        input: path.resolve(import.meta.dirname, 'fixtures', pathname),
        plugins: [lwc(options)],
        external: ['lwc', ...external],
        onwarn(warning) {
            warnings.push(warning);
        },
    });

    return {
        bundle,
        warnings,
    };
}

describe('templateConfig', () => {
    it('compile with preserveHtmlComments option', async () => {
        const { bundle } = await runRollup('test/test.js', {
            preserveHtmlComments: true,
        });

        const { output } = await bundle.generate({
            format: 'esm',
        });

        expect(output[0].code).toContain('Application container');
    });

    it('should accept disableSyntheticShadowSupport config flag', async () => {
        const { bundle } = await runRollup('test/test.js', {
            disableSyntheticShadowSupport: true,
        });

        const { output } = await bundle.generate({
            format: 'esm',
        });

        // This function takes no arguments, corresponding to the optimization used
        // for `disableSyntheticShadowSupport: true` by serialize.ts in @lwc/style-compiler
        expect(output[0].code).toContain('function stylesheet()');
    });

    it('should accept enableDynamicComponents config flag', async () => {
        const { bundle } = await runRollup('dynamicComponent/dynamicComponent.js', {
            enableDynamicComponents: true,
        });

        const { output } = await bundle.generate({
            format: 'esm',
        });

        expect(output[0].code).toContain('api_dynamic_component');
    });

    it('should accept experimentalDynamicDirective config flag', async () => {
        const { bundle, warnings } = await runRollup('experimentalDynamic/experimentalDynamic.js', {
            experimentalDynamicDirective: true,
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
        const { bundle } = await runRollup(
            'dynamicImportConfig/dynamicImportConfig.js',
            {
                experimentalDynamicComponent: { loader: CUSTOM_LOADER, strictSpecifier: true },
            },
            {
                external: [CUSTOM_LOADER],
            }
        );

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

        const { bundle } = await runRollup(
            'lightningWebSecurityTransforms/lightningWebSecurityTransforms.js',
            {
                enableLightningWebSecurityTransforms: true,
            }
        );

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
