/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { version } from 'typescript';
import { expect, test } from 'vitest';

// This is more of a repo configuration test than a test of the `lwc` package,
// but we don't really have a place to catch accidental foot-gunnery.

test('TypeScript version should not change', () => {
    // Because we are a library, bumping the version of TypeScript is a
    // potentially breaking change. Code that may compile using our version may
    // result in type errors in different versions (e.g. using new syntax).
    expect(version, 'TypeScript version should only change for major releases of LWC').toBe(
        '6.0.0-dev.20260112'
    );
});
