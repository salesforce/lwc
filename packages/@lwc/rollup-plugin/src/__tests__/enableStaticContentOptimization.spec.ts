/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, it, expect } from 'vitest';
import { runRollup } from './util';

describe('enableStaticContentOptimization:', () => {
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
        const { code, warnings } = await runRollup('image/image.js', opts);
        expect(warnings).toEqual([]);
        expect(code.includes('<img')).toBe(expected);
    });
});
