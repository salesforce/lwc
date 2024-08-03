/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// export {}; // required to have a module with just `declare vitest` in it

import 'vitest';

interface CustomMatchers<R = unknown> {
    toThrowErrorWithCode: (received: any, ctor: any, message?: string) => R;
    toThrowErrorWithType: (received: any, ctor: any, message?: string) => R;
}

declare module 'vitest' {
    interface Assertion<T = any> extends CustomMatchers<T> {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
}
