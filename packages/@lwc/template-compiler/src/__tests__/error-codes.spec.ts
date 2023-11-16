/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ErrorCodes } from 'parse5';
import { errorCodesToErrorOn, errorCodesToWarnOnInOlderAPIVersions } from '../parser/parse5Errors';

describe('error codes', () => {
    it('all parse5 error codes are accounted for', () => {
        const allKnownCodes = new Set([
            ...errorCodesToErrorOn,
            ...errorCodesToWarnOnInOlderAPIVersions,
        ]);
        for (const code of Object.values(ErrorCodes)) {
            expect(allKnownCodes.has(code)).toEqual(true);
        }
    });
});
