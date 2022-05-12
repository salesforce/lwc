/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'path';
import { rollup, RollupWarning } from 'rollup';

import lwc from '../../index';

function normalizeWarning(warning: RollupWarning) {
    return {
        code: warning.code,
        frame: warning.frame,
        hook: warning.hook,
        id: warning.id && path.relative(__dirname, warning.id),
        message: warning.message,
        plugin: warning.plugin,
        pluginCode: warning.pluginCode,
        loc: warning.loc && {
            column: warning.loc.column,
            line: warning.loc.line,
            file: warning.loc.file && path.relative(__dirname, warning.loc.file),
        },
    };
}

describe('warnings', () => {
    it('should emit a warning for double </template> tags', async () => {
        const warnings: RollupWarning[] = [];
        const bundle = await rollup({
            input: path.resolve(__dirname, 'fixtures/test/test.js'),
            plugins: [lwc()],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        const { output } = await bundle.generate({
            format: 'esm',
        });

        // Compilation should be successful
        expect(output.length).toEqual(1);
        expect(typeof output[0].code).toEqual('string');
        expect(warnings.map(normalizeWarning)).toEqual([
            {
                code: 'PLUGIN_WARNING',
                frame: '</template>',
                hook: 'transform',
                id: 'fixtures/test/test.html',
                message:
                    '@lwc/rollup-plugin: LWC1148: Invalid HTML syntax: end-tag-without-matching-open-element. ' +
                    'This will not be supported in future versions of LWC. For more information, please visit ' +
                    'https://html.spec.whatwg.org/multipage/parsing.html#parse-error-end-tag-without-matching-open-element',
                plugin: 'rollup-plugin-lwc-compiler',
                pluginCode: 'LWC1148',
                loc: {
                    column: 1,
                    line: 4,
                    file: 'fixtures/test/test.html',
                },
            },
        ]);
    });
});
