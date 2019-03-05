/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { transform } from '../index';

describe('playground test for debugging ', () => {
    it('examples', () => {
        const src = `
            @import "@foo/test";
        `;
        const { code } = transform(src, 'test', {
            customProperties: {
                resolverModule: 'custom-properties-resolver',
            },
        });

        expect(code).toBeDefined();
    });
});
