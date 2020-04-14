/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { hasOwnProperty } from '@lwc/shared';
import * as CompilerErrors from '../compiler/error-info';
import { LWCErrorInfo } from '../shared/types';

const ERROR_CODE_RANGES = {
    compiler: {
        min: 1001,
        max: 1999,
    },
};

interface ExtendedMatcher extends jest.Matchers<void> {
    toBeUniqueCode: (key: string, seenErrorCodes: Set<number>) => object;
    toBeInRange: (min: number, max: number, key: string) => object;
}

expect.extend({
    toBeInRange(code, min, max, key) {
        const pass = Number.isInteger(code) && code >= min && code <= max;
        const message = () =>
            `expected ${key}'s error code '${code}'${
                pass ? ' not ' : ' '
            }to be in the range ${min}-${max}`;

        return { message, pass };
    },

    toBeUniqueCode(code, key, seenErrorCodes: Set<number>) {
        const pass = !seenErrorCodes.has(code);
        const message = () =>
            `expected ${key}'s error code '${code}' to${
                pass ? ' not ' : ' '
            }be a unique error code`;

        return { message, pass };
    },
});

function traverseErrorInfo(object, fn: (errorInfo: LWCErrorInfo, path: string) => void, path) {
    Object.keys(object).forEach((key) => {
        const property = object[key];
        if (property && hasOwnProperty.call(property, 'code')) {
            fn(property as LWCErrorInfo, `${path}.${key}`);
        } else if (property) {
            traverseErrorInfo(property, fn, `${path}.${key}`);
        }
    });
}

describe('error validation', () => {
    it('compiler error codes are in the correct range', () => {
        function validate(errorInfo: LWCErrorInfo, key: string) {
            (expect(errorInfo.code) as ExtendedMatcher).toBeInRange(
                ERROR_CODE_RANGES.compiler.min,
                ERROR_CODE_RANGES.compiler.max,
                key
            );
        }

        traverseErrorInfo(CompilerErrors, validate, 'compiler');
    });

    it('error codes are unique', () => {
        const seenCodes = new Set<number>();
        function checkUniqueness(errorInfo: LWCErrorInfo, key: string) {
            (expect(errorInfo.code) as ExtendedMatcher).toBeUniqueCode(key, seenCodes);
            seenCodes.add(errorInfo.code);
        }

        traverseErrorInfo(CompilerErrors, checkUniqueness, 'compiler');
    });
});
