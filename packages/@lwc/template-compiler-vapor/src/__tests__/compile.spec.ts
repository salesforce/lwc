/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, test, expect } from 'vitest';
import { compileVapor } from '../compile';

describe('vapor compiler', () => {
    describe('static content', () => {
        test('compiles a static element', () => {
            const { code, warnings } = compileVapor(`<template><div>hello</div></template>`);
            expect(warnings).toHaveLength(0);
            expect(code).toContain('template(');
            expect(code).toContain('<div>hello</div>');
            expect(code).toContain('export default function render');
        });

        test('compiles static attributes', () => {
            const { code } = compileVapor(`<template><input type="text" disabled></template>`);
            // Static attributes are embedded into the hoisted template string
            expect(code).toContain('type=');
            expect(code).toContain('text');
            expect(code).toContain('disabled');
        });

        test('compiles nested static content', () => {
            const { code } = compileVapor(
                `<template><div><p>nested</p><span>content</span></div></template>`
            );
            expect(code).toContain('<div><p>nested</p><span>content</span></div>');
        });
    });

    describe('dynamic bindings', () => {
        test('compiles dynamic property binding', () => {
            const { code } = compileVapor(`<template><input value={inputValue}></template>`);
            expect(code).toContain('renderEffect');
            expect(code).toContain('setProp');
            expect(code).toContain('$cmp.inputValue');
        });

        test('compiles dynamic class binding', () => {
            const { code } = compileVapor(`<template><div class={computedClass}></div></template>`);
            expect(code).toContain('renderEffect');
            expect(code).toContain('setClass');
            expect(code).toContain('$cmp.computedClass');
        });

        test('compiles dynamic text interpolation', () => {
            const { code } = compileVapor(`<template><div>{message}</div></template>`);
            expect(code).toContain('renderEffect');
            expect(code).toContain('setText');
            expect(code).toContain('$cmp.message');
        });
    });

    describe('event handling', () => {
        test('compiles click event with delegation', () => {
            const { code } = compileVapor(
                `<template><button onclick={handleClick}>Click</button></template>`
            );
            expect(code).toContain('delegateEvents');
            expect(code).toContain('delegate');
            expect(code).toContain('$cmp.handleClick');
        });

        test('compiles non-delegatable event', () => {
            const { code } = compileVapor(
                `<template><div onscroll={handleScroll}>content</div></template>`
            );
            expect(code).toContain('on(');
            expect(code).toContain('$cmp.handleScroll');
            expect(code).not.toContain('delegateEvents');
        });
    });

    describe('conditional rendering', () => {
        test('compiles if:true directive', () => {
            const { code } = compileVapor(
                `<template><div if:true={isVisible}>shown</div></template>`
            );
            expect(code).toContain('createIf');
            expect(code).toContain('$cmp.isVisible');
        });

        test('compiles lwc:if directive', () => {
            const { code } = compileVapor(
                `<template><div lwc:if={showContent}>content</div></template>`
            );
            expect(code).toContain('createIf');
            expect(code).toContain('$cmp.showContent');
        });
    });

    describe('list rendering', () => {
        test('compiles for:each directive', () => {
            const { code } = compileVapor(
                `<template><div for:each={items} for:item="item" key={item.id}><span>{item.name}</span></div></template>`
            );
            expect(code).toContain('createFor');
            expect(code).toContain('$cmp.items');
            expect(code).toContain('item.id');
        });
    });

    describe('template refs', () => {
        test('compiles lwc:ref directive', () => {
            const { code } = compileVapor(
                `<template><div lwc:ref="myDiv">content</div></template>`
            );
            expect(code).toContain('applyRefs');
            expect(code).toContain('"myDiv"');
        });
    });

    describe('output format', () => {
        test('imports from @lwc/engine-vapor', () => {
            const { code } = compileVapor(`<template><div>static</div></template>`);
            expect(code).toContain("from '@lwc/engine-vapor'");
        });

        test('exports a render function', () => {
            const { code } = compileVapor(`<template><div>content</div></template>`);
            expect(code).toContain('export default function render($cmp, $slotset)');
        });

        test('hoists template strings', () => {
            const { code } = compileVapor(`<template><div><p>text</p></div></template>`);
            // Template declaration should be outside render function
            const templateLine = code.indexOf('const t0 = template(');
            const renderLine = code.indexOf('export default function render');
            expect(templateLine).toBeLessThan(renderLine);
        });
    });
});
