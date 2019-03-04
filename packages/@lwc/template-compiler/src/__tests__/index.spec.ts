/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import compiler from '../index';

describe('option validation', () => {
    it('validated presence of options', () => {
        expect(() => {
            // Use call to escape typescript type checking
            compiler.call(null, `<template></template>`);
        }).toThrow(/Compiler options must be an object/);
    });

    it('throws for unknown compiler option', () => {
        expect(() => {
            compiler(`<template></template>`, { foo: true } as any);
        }).toThrow(/Unknown option property foo/);
    });
});
