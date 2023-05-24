/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import compile, { parse } from '../index';

describe('option validation', () => {
    it('validated presence of options', () => {
        expect(() => {
            // @ts-ignore
            compile(`<template></template>`);
        }).toThrow(/Compiler options must be an object/);
    });

    it('throws for unknown compiler option', () => {
        expect(() => {
            compile(`<template></template>`, { foo: true } as any);
        }).toThrow(/Unknown option property foo/);
    });
});

describe('parse', () => {
    it('returns the AST root on successful invocation', () => {
        const res = parse(`<template>Hello world!</template>`);

        expect(res.root).toBeDefined();
        expect(res.warnings).toHaveLength(0);
    });

    it('returns diagnostics on failed invocation', () => {
        const res = parse(`<template>Hello world!`);

        expect(res.root).not.toBeDefined();
        expect(res.warnings).toHaveLength(1);
    });
});

describe('instrumentation', () => {});
