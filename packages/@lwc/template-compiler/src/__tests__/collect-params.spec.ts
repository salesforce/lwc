/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, test, expect } from 'vitest';
import { ParserDiagnostics } from '@lwc/errors';
import compile from '../index';

const config = { experimentalComplexExpressions: true };

function compileTemplate(template: string) {
    const { code, warnings } = compile(template, 'x-test', config);
    return { code, warnings };
}

describe('collectParams', () => {
    test('collects identifiers from object patterns', () => {
        const { code, warnings } = compileTemplate(
            `<template><button onclick="{({ a, b }) => a + b}"></button></template>`
        );
        expect(warnings).toHaveLength(0);
        expect(code).toContain('({a, b}) => a + b');
    });

    test('collects identifiers from array patterns, including holes', () => {
        const { code, warnings } = compileTemplate(
            `<template><button onclick="{([, y]) => y}"></button></template>`
        );
        expect(warnings).toHaveLength(0);
        expect(code).toContain('([, y]) => y');
    });

    test('collects identifiers from rest elements', () => {
        const { code, warnings } = compileTemplate(
            `<template><button onclick="{(...rest) => rest.length}"></button></template>`
        );
        expect(warnings).toHaveLength(0);
        expect(code).toContain('(...rest) => rest.length');
    });

    test('rejects unsupported parameter patterns', () => {
        const { warnings } = compileTemplate(
            `<template><button onclick="{(x = 1) => x}"></button></template>`
        );
        const err = warnings.find(
            (w) => w.code === ParserDiagnostics.INVALID_EXPR_ARROW_FN_PARAM.code
        );
        expect(err?.code).toBe(ParserDiagnostics.INVALID_EXPR_ARROW_FN_PARAM.code);
        expect(err!.message).toContain('arrow function params');
    });
});
