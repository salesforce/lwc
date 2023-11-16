/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DiagnosticLevel } from '@lwc/errors';
import compile, { Config, parse } from '../index';

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

    describe('apiVersion', () => {
        const configs: { name: string; config: Config }[] = [
            { name: '58', config: { apiVersion: 58 } },
            { name: '59', config: { apiVersion: 59 } },
            { name: 'undefined', config: { apiVersion: undefined } },
            // someone may pass us null despite the types
            { name: 'null', config: { apiVersion: null } as unknown as Config },
            { name: 'unspecified', config: {} },
        ];
        configs.forEach(({ name, config }) => {
            it(`parse() with double </template> with config=${name}`, () => {
                const result = parse('<template></template></template>', config);
                const expectWarning = config.apiVersion === 58; // null/undefined/unspecified is treated as latest
                expect(result.warnings.length).toBe(1);
                expect(result.warnings[0].level).toBe(
                    expectWarning ? DiagnosticLevel.Warning : DiagnosticLevel.Error
                );
                expect(result.warnings[0].code).toBe(expectWarning ? 1148 : 1058);
                expect(result.warnings[0].message).toContain(
                    'end-tag-without-matching-open-element'
                );
            });
        });
    });

    describe('enableStaticContentOptimization: ', () => {
        const configs: { name: string; config: Config; expected: boolean }[] = [
            {
                name: 'undefined',
                config: { enableStaticContentOptimization: undefined },
                expected: false,
            },
            { name: 'false', config: { enableStaticContentOptimization: false }, expected: false },
            { name: 'true', config: { enableStaticContentOptimization: true }, expected: true },
            { name: 'unspecified', config: {}, expected: true },
        ];
        configs.forEach(({ name, config, expected }) => {
            it(name, () => {
                const template = `<template><img src="http://example.com/img.png" crossorigin="anonymous"></template>`;
                const { code, warnings } = compile(template, config);
                expect(warnings.length).toBe(0);
                if (expected) {
                    expect(code).toContain('<img');
                } else {
                    expect(code).not.toContain('<img');
                }
            });
        });
    });
});
