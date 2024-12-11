/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, it, expect } from 'vitest';
import { validateStyleTextContents } from '../utils/validate-style-text-contents';

// See https://html.spec.whatwg.org/multipage/syntax.html#cdata-rcdata-restrictions
describe('validateStyleTextContents', () => {
    it('throws an error for invalid style text content', () => {
        const invalidStrings = [
            '</style\t',
            '</style\n',
            '</style\f',
            '</style\r',
            '</style ',
            '</style>',
            '</style/',
        ];

        for (const invalidString of invalidStrings) {
            expect(() => validateStyleTextContents(invalidString)).toThrow(
                /CSS contains unsafe characters/
            );
            expect(() => validateStyleTextContents(invalidString.toUpperCase())).toThrow(
                /CSS contains unsafe characters/
            );
        }
    });

    it('does not throw for valid text content', () => {
        const validStrings = ['</style', '</ style>', `data-foo="<>'&"] {}`, `data-foo='"'] {}`];

        for (const validString of validStrings) {
            expect(() => validateStyleTextContents(validString)).not.toThrow();
            expect(() => validateStyleTextContents(validString.toUpperCase())).not.toThrow();
        }
    });
});
