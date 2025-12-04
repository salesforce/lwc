/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { rollup } from 'rollup';
import lwc from '../../index';
import type { RollupLog } from 'rollup';
import type { RollupLwcOptions } from '../../index';

describe('enableStaticContentOptimization:', () => {
    async function runRollup(
        pathname: string,
        options: RollupLwcOptions
    ): Promise<{ code: string; warnings: RollupLog[] }> {
        const warnings: RollupLog[] = [];
        const bundle = await rollup({
            input: path.resolve(__dirname, pathname),
            plugins: [lwc(options)],
            external: ['lwc'],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        const { output } = await bundle.generate({
            format: 'esm',
        });

        return {
            code: output[0].code,
            warnings,
        };
    }

    const configs = [
        {
            name: 'undefined',
            opts: { enableStaticContentOptimization: undefined },
            expected: false,
        },
        { name: 'false', opts: { enableStaticContentOptimization: false }, expected: false },
        { name: 'true', opts: { enableStaticContentOptimization: true }, expected: true },
        { name: 'unspecified', opts: {}, expected: true },
    ];

    it.for(configs)('$name', async ({ opts, expected }) => {
        const { code, warnings } = await runRollup('fixtures/basic/basic.js', opts);
        expect(warnings).toEqual([]);
        expect(code.includes('<img')).toBe(expected);
    });
});
