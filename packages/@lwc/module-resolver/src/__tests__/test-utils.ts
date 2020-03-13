/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as path from 'path';

// Declare custom jest matchers.
declare global {
    namespace jest {
        interface Matchers<R> {
            toThrowErrorWithType(ctor: typeof Error, message: string): R;
        }
    }
}

export function fixture(relPath: string): string {
    return path.resolve(__dirname, 'fixtures', relPath);
}
