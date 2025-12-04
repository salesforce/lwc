/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import 'vitest';

interface CustomMatchers<R = unknown> {
    toThrowAggregateError: (expectedErrorMessages?: string[]) => R;
}

declare module 'vitest' {
    // TypeScript interfaces get merged; this is a false positive
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Assertion<T = any> extends CustomMatchers<T> {}
    // TypeScript interfaces get merged; this is a false positive
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface AsymmetricMatchersContaining extends CustomMatchers {}
}
