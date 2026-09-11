/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 *
 * End-to-end integration tests: compile a template with the vapor compiler,
 * then execute the generated render function against the vapor runtime and
 * assert the resulting DOM.
 */
import { describe, test, expect } from 'vitest';
import { compileVapor } from '@lwc/template-compiler-vapor';

import { template } from '../dom/template';
import { setText, setAttr, setClass, setStyle, setProp, setDynamicProps } from '../dom/prop';
import { child, nthChild, next } from '../dom/node';
import { on, delegate, delegateEvents } from '../dom/event';
import { renderEffect } from '../renderEffect';
import { createIf } from '../createIf';
import { createFor } from '../createFor';
import { createSlot } from '../slot';
import { insertBlock } from '../block';
import { insert } from '../dom/insert';
import { createReactiveProxy } from '../reactivity';

// Runtime helpers available to compiled code
const RUNTIME = {
    template,
    setText,
    setAttr,
    setClass,
    setStyle,
    setProp,
    setDynamicProps,
    child,
    nthChild,
    next,
    on,
    delegate,
    delegateEvents,
    // Standalone harness: no Locker hooks, so handler invocation is just `fn(e)`
    // (the real runtime's invokeHandler routes through callHook when installed).
    invokeHandler: (_cmp: any, fn: any, e: Event) => fn(e),
    // Standalone harness: no per-instance memo store, just evaluate the producer.
    memoEvent: (_cmp: any, _id: number, produce: () => any) => produce(),
    renderEffect,
    createIf,
    createFor,
    createSlot,
    insert,
    applyRefs: (el: Element, name: string, cmp: any) => {
        if (!cmp.$refs) cmp.$refs = {};
        cmp.$refs[name] = el;
    },
};

/**
 * Compiles a template and turns the generated ESM into an executable render function.
 */
function compileToRenderFn(source: string): (cmp: any, slotset?: any) => any {
    const { code, warnings } = compileVapor(source);
    expect(warnings).toHaveLength(0);

    // Strip the ESM import line and the `export default` keyword so we can eval it
    const body = code
        .replace(/^import\s+\{[^}]*\}\s+from\s+'[^']*';?\s*$/m, '')
        .replace('export default function render', 'return function render');

    const factory = new Function(...Object.keys(RUNTIME), body);
    return factory(...Object.values(RUNTIME));
}

function mount(source: string, cmp: any, slotset?: any): HTMLElement {
    const renderFn = compileToRenderFn(source);
    const container = document.createElement('div');
    const block = renderFn(cmp, slotset);
    insertBlock(block, container);
    return container;
}

describe('vapor end-to-end', () => {
    describe('static rendering', () => {
        test('renders static element', () => {
            const container = mount(`<template><div>hello world</div></template>`, {});
            expect(container.textContent).toBe('hello world');
            expect(container.querySelector('div')).not.toBeNull();
        });

        test('renders nested elements', () => {
            const container = mount(
                `<template><section><h1>Title</h1><p>Body</p></section></template>`,
                {}
            );
            expect(container.querySelector('h1')?.textContent).toBe('Title');
            expect(container.querySelector('p')?.textContent).toBe('Body');
        });
    });

    describe('dynamic text', () => {
        test('renders reactive text interpolation', () => {
            const cmp = createReactiveProxy({ message: 'initial' });
            const container = mount(`<template><div>{message}</div></template>`, cmp);
            expect(container.textContent).toContain('initial');

            cmp.message = 'updated';
            expect(container.textContent).toContain('updated');
        });
    });

    describe('dynamic attributes', () => {
        test('reactively updates a property binding', () => {
            const cmp = createReactiveProxy({ inputValue: 'first' });
            const container = mount(`<template><input value={inputValue}></template>`, cmp);
            const input = container.querySelector('input') as HTMLInputElement;
            expect(input.value).toBe('first');

            cmp.inputValue = 'second';
            expect(input.value).toBe('second');
        });

        test('reactively updates class binding', () => {
            const cmp = createReactiveProxy({ computedClass: 'active' });
            const container = mount(`<template><div class={computedClass}></div></template>`, cmp);
            const div = container.querySelector('div') as HTMLElement;
            expect(div.className).toBe('active');

            cmp.computedClass = 'inactive';
            expect(div.className).toBe('inactive');
        });
    });

    describe('conditional rendering', () => {
        test('toggles content with lwc:if', () => {
            const cmp = createReactiveProxy({ showContent: true });
            const container = mount(
                `<template><div lwc:if={showContent}>conditional</div></template>`,
                cmp
            );
            expect(container.textContent).toContain('conditional');

            cmp.showContent = false;
            expect(container.textContent).not.toContain('conditional');

            cmp.showContent = true;
            expect(container.textContent).toContain('conditional');
        });
    });

    describe('list rendering', () => {
        test('renders and updates a list', () => {
            const cmp = createReactiveProxy({
                items: [
                    { id: 1, name: 'apple' },
                    { id: 2, name: 'banana' },
                ],
            });
            const container = mount(
                `<template><span for:each={items} for:item="item" key={item.id}>static</span></template>`,
                cmp
            );
            expect(container.querySelectorAll('span').length).toBe(2);

            cmp.items = [
                { id: 1, name: 'apple' },
                { id: 2, name: 'banana' },
                { id: 3, name: 'cherry' },
            ];
            expect(container.querySelectorAll('span').length).toBe(3);
        });

        test('renders a nested list inside a static parent (ul > li)', () => {
            const cmp = createReactiveProxy({
                items: [
                    { id: 1, name: 'apple' },
                    { id: 2, name: 'banana' },
                    { id: 3, name: 'cherry' },
                ],
            });
            const container = mount(
                `<template><ul><li for:each={items} for:item="item" key={item.id}>static</li></ul></template>`,
                cmp
            );
            const ul = container.querySelector('ul') as HTMLElement;
            expect(ul).not.toBeNull();
            expect(ul.querySelectorAll('li').length).toBe(3);

            // The list should live inside the <ul>, not as siblings of it.
            expect(container.querySelectorAll('ul > li').length).toBe(3);

            cmp.items = [{ id: 1, name: 'apple' }];
            expect(ul.querySelectorAll('li').length).toBe(1);
        });

        test('renders conditional nested inside a static parent', () => {
            const cmp = createReactiveProxy({ visible: false });
            const container = mount(
                `<template><section><p lwc:if={visible}>conditional</p></section></template>`,
                cmp
            );
            const section = container.querySelector('section') as HTMLElement;
            expect(section).not.toBeNull();
            expect(section.querySelector('p')).toBeNull();

            cmp.visible = true;
            expect(section.querySelector('p')?.textContent).toContain('conditional');

            cmp.visible = false;
            expect(section.querySelector('p')).toBeNull();
        });
    });

    describe('event handling', () => {
        test('handles delegated click events', () => {
            document.body.innerHTML = '';
            let clicked = false;
            const cmp = { handleClick: () => (clicked = true) };
            const container = mount(
                `<template><button onclick={handleClick}>Click</button></template>`,
                cmp
            );
            // Delegated events require the node to be in the document
            document.body.appendChild(container);
            const button = container.querySelector('button') as HTMLButtonElement;
            button.click();
            expect(clicked).toBe(true);
            document.body.removeChild(container);
        });

        // Regression guard for the js-framework-benchmark select/remove-row ops. Vapor
        // invokes template-bound handlers MANUALLY from a single `document`-level listener,
        // so without intervention the native `event.currentTarget` would be `document` for
        // the whole walk. `delegatedEventHandler` shadows `currentTarget` with the element
        // whose handler is running (the one carrying `onclick=` + `data-*`), matching classic
        // LWC's per-element native binding. Clicking a NESTED child must still report the
        // delegating parent as `currentTarget` while `target` is the clicked descendant.
        test('exposes the delegating element as event.currentTarget (not document)', () => {
            document.body.innerHTML = '';
            let seenId: string | undefined;
            let seenInteraction: string | undefined;
            let seenCurrentTag: string | undefined;
            let seenTargetTag: string | undefined;
            const cmp = {
                handleRowClick: (e: Event) => {
                    const target = e.target as HTMLElement;
                    const currentTarget = e.currentTarget as HTMLElement;
                    seenInteraction = target.dataset.interaction;
                    seenId = currentTarget?.dataset.id;
                    seenCurrentTag = currentTarget?.tagName.toLowerCase();
                    seenTargetTag = target?.tagName.toLowerCase();
                },
            };
            const container = mount(
                `<template><div data-id="42" onclick={handleRowClick}><a data-interaction="select"><span data-interaction="select">select</span></a></div></template>`,
                cmp
            );
            document.body.appendChild(container);
            const icon = container.querySelector('span') as HTMLElement;
            icon.click();

            // currentTarget is the delegating <div>, regardless of which descendant was clicked.
            expect(seenId).toBe('42');
            expect(seenCurrentTag).toBe('div');
            // target is the actual clicked node (the inner <span>), distinct from currentTarget.
            expect(seenTargetTag).toBe('span');
            expect(seenInteraction).toBe('select');
            document.body.removeChild(container);
        });

        // The `currentTarget` override must be torn down after dispatch: native events report
        // `currentTarget === null` once dispatch has finished. The `finally` in
        // `delegatedEventHandler` restores that, so reading `currentTarget` on the stale event
        // object afterward must NOT still return the delegating element.
        test('restores native currentTarget (null) after dispatch completes', () => {
            document.body.innerHTML = '';
            let captured: Event | undefined;
            const cmp = { handleClick: (e: Event) => (captured = e) };
            const container = mount(
                `<template><button onclick={handleClick}>Click</button></template>`,
                cmp
            );
            document.body.appendChild(container);
            (container.querySelector('button') as HTMLButtonElement).click();
            expect(captured).toBeDefined();
            // After dispatch, the override is removed and the native getter reports null.
            expect(captured!.currentTarget).toBeNull();
            document.body.removeChild(container);
        });
    });
});
