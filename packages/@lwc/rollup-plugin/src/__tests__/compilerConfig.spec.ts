/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, it, expect } from 'vitest';

import { runRollup } from './util';

describe('templateConfig', () => {
    it('compile with preserveHtmlComments option', async () => {
        const { code } = await runRollup('test/test.js', {
            preserveHtmlComments: true,
        });

        expect(code).toContain('Application container');
    });

    it('should accept disableSyntheticShadowSupport config flag', async () => {
        const { code } = await runRollup('test/test.js', {
            disableSyntheticShadowSupport: true,
        });

        // This function takes no arguments, corresponding to the optimization used
        // for `disableSyntheticShadowSupport: true` by serialize.ts in @lwc/style-compiler
        expect(code).toContain('function stylesheet()');
    });

    it('should accept enableDynamicComponents config flag', async () => {
        const { code } = await runRollup('dynamicComponent/dynamicComponent.js', {
            enableDynamicComponents: true,
        });

        expect(code).toContain('api_dynamic_component');
    });

    it('should accept experimentalDynamicDirective config flag', async () => {
        const { code, warnings } = await runRollup('experimentalDynamic/experimentalDynamic.js', {
            experimentalDynamicDirective: true,
        });

        expect(warnings).toHaveLength(1);
        expect(warnings?.[0]?.message).toContain(
            'LWC1187: The lwc:dynamic directive is deprecated'
        );
        expect(code).toContain('api_deprecated_dynamic_component');
    });
});

describe('javaScriptConfig', () => {
    it('should accept dynamicImports config flag', async () => {
        const CUSTOM_LOADER = '@salesforce/loader';
        const { imports } = await runRollup(
            'dynamicImportConfig/dynamicImportConfig.js',
            {
                dynamicImports: { loader: CUSTOM_LOADER, strictSpecifier: true },
            },
            {
                external: [CUSTOM_LOADER],
            }
        );

        expect(imports).toContain(CUSTOM_LOADER);
    });
});

describe('lwsConfig', () => {
    it('should accept enableLightningWebSecurityTransforms config flag', async () => {
        function stripWhitespace(string: string) {
            return string.replace(/\s/g, '');
        }

        const { code } = await runRollup(
            'lightningWebSecurityTransforms/lightningWebSecurityTransforms.js',
            {
                enableLightningWebSecurityTransforms: true,
            }
        );

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
