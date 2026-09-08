/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { vi, describe, it, expect } from 'vitest';
import { transformSync } from '../transformer';
import type { TransformOptions } from '../../options';

// Mock the vapor template compiler so we can drive its two failure modes:
// an error-level warning, and a thrown exception. Neither is reachable through
// real template input (the vapor compiler is lenient and its warnings never
// contain the word "error"), so mocking is the only way to cover the vapor
// block's error handling in the compiler transformer.
const { compileVapor } = vi.hoisted(() => ({ compileVapor: vi.fn() }));
vi.mock('@lwc/template-compiler-vapor', () => ({ compileVapor }));

const BASE_TRANSFORM_OPTIONS = {
    namespace: 'x',
    name: 'foo',
    enableVaporCompilation: true,
} satisfies TransformOptions;

const template = `<template><div>Hello</div></template>`;

describe('transformSync with enableVaporCompilation error handling', () => {
    it('throws a compiler error when the vapor compiler reports an error-level warning', () => {
        compileVapor.mockReturnValueOnce({
            code: '',
            warnings: ['Some ERROR while compiling the template'],
        });

        expect(() => transformSync(template, 'foo.html', BASE_TRANSFORM_OPTIONS)).toThrow(
            'Some ERROR while compiling the template'
        );
    });

    it('normalizes an exception thrown by the vapor compiler into a compiler error', () => {
        compileVapor.mockImplementationOnce(() => {
            throw new Error('vapor exploded');
        });

        expect(() => transformSync(template, 'foo.html', BASE_TRANSFORM_OPTIONS)).toThrow(
            'vapor exploded'
        );
    });
});
