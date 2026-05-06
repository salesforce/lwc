/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, test, expect } from 'vitest';
import { builders as b } from 'estree-toolkit';
import { createNewContext } from '../context';
import type { TemplateOpts } from '../types';

const templateOptions: TemplateOpts = {
    preserveComments: false,
    experimentalComplexExpressions: false,
    apiVersion: 65,
};

describe('createNewContext', () => {
    describe('hoist.module', () => {
        test('dedupes module-level statements when a dedupe key is provided', () => {
            const { cxt } = createNewContext(templateOptions);
            const stmt = b.expressionStatement(b.literal(1));

            cxt.hoist.module(stmt, 'key');
            cxt.hoist.module(stmt, 'key');

            expect(cxt.hoistedStatements.module).toHaveLength(1);
        });

        test('does not dedupe when no key is provided', () => {
            const { cxt } = createNewContext(templateOptions);
            const stmt = b.expressionStatement(b.literal(1));

            cxt.hoist.module(stmt);
            cxt.hoist.module(stmt);

            expect(cxt.hoistedStatements.module).toHaveLength(2);
        });
    });

    describe('hoist.templateFn', () => {
        test('dedupes template-fn statements when a dedupe key is provided', () => {
            const { cxt } = createNewContext(templateOptions);
            const stmt = b.expressionStatement(b.literal(1));

            cxt.hoist.templateFn(stmt, 'key');
            cxt.hoist.templateFn(stmt, 'key');

            expect(cxt.hoistedStatements.templateFn).toHaveLength(1);
        });

        test('does not dedupe when no key is provided', () => {
            const { cxt } = createNewContext(templateOptions);
            const stmt = b.expressionStatement(b.literal(1));

            cxt.hoist.templateFn(stmt);
            cxt.hoist.templateFn(stmt);

            expect(cxt.hoistedStatements.templateFn).toHaveLength(2);
        });
    });

    describe('slots.shadow', () => {
        test('register returns a cached function name for duplicate node ids', () => {
            const { cxt } = createNewContext(templateOptions);

            const first = cxt.slots.shadow.register('node-1', 'x-foo');
            const second = cxt.slots.shadow.register('node-1', 'x-foo');

            expect(first).toBe(second);
            expect(cxt.slots.shadow.isDuplicate('node-1')).toBe(true);
        });

        test('register mints a new function name for each distinct node id', () => {
            const { cxt } = createNewContext(templateOptions);

            const first = cxt.slots.shadow.register('node-1', 'x-foo');
            const second = cxt.slots.shadow.register('node-2', 'x-foo');

            expect(first).not.toBe(second);
            expect(cxt.slots.shadow.isDuplicate('node-2')).toBe(true);
        });

        test('getFnName returns null when the id has not been registered', () => {
            const { cxt } = createNewContext(templateOptions);
            expect(cxt.slots.shadow.getFnName('never-registered')).toBeNull();
        });
    });

    describe('local variables', () => {
        test('isLocalVar returns false for falsy names without consulting the stack', () => {
            const { cxt } = createNewContext(templateOptions);
            cxt.pushLocalVars(['foo']);

            expect(cxt.isLocalVar(undefined)).toBe(false);
            expect(cxt.isLocalVar(null)).toBe(false);
            expect(cxt.isLocalVar('')).toBe(false);
        });

        test('isLocalVar finds names on any stack frame', () => {
            const { cxt } = createNewContext(templateOptions);
            cxt.pushLocalVars(['outer']);
            cxt.pushLocalVars(['inner']);

            expect(cxt.isLocalVar('outer')).toBe(true);
            expect(cxt.isLocalVar('inner')).toBe(true);

            cxt.popLocalVars();
            expect(cxt.isLocalVar('inner')).toBe(false);
            expect(cxt.isLocalVar('outer')).toBe(true);
        });

        test('getLocalVars returns the unique names across stack frames', () => {
            const { cxt } = createNewContext(templateOptions);
            cxt.pushLocalVars(['a', 'b']);
            cxt.pushLocalVars(['b', 'c']);

            expect(cxt.getLocalVars().sort()).toEqual(['a', 'b', 'c']);
        });
    });
});
