/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import parse5Errors from 'parse5/lib/common/error-codes';
import { errorCodesToErrorOn, errorCodesToWarnOnInOlderAPIVersions } from '../parser/parse5Errors';

describe('error codes', () => {
    it('all parse5 error codes are accounted for', () => {
        const allKnownCodes = new Set([
            ...errorCodesToErrorOn,
            ...errorCodesToWarnOnInOlderAPIVersions,
        ]);
        for (const code of Object.values(parse5Errors)) {
            expect(allKnownCodes.has(code as string)).toEqual(true);
        }
    });
});
