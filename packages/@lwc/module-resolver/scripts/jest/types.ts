/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export {}; // required to have a module with just `declare global` in it

declare global {
    namespace jest {
        interface Matchers<R> {
            __type: R; // unused, but makes TypeScript happy
            toThrowErrorWithCode(received: any, ctor: any, message?: string): CustomMatcherResult;
            toThrowErrorWithType(received: any, ctor: any, message?: string): CustomMatcherResult;
        }
    }
}
