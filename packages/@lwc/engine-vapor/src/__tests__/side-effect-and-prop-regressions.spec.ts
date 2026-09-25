/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 *
 * Regression suite for three Vapor-Mode diagnostics that surfaced only on real
 * LEX base components and escaped the existing suite because they are dev-only
 * `console.error`/`console.warn` output that never throws — nothing failed a
 * test on them (there is no global console guard in the vitest config chain).
 *
 * This spec closes that accountability gap on two fronts:
 *   1. `expectNoConsoleErrorsOrWarnings()` installs a per-test spy that FAILS the
 *      test if an UNEXPECTED `[LWC error]`/`[LWC warn]` fires — so a future
 *      regression of any of these can't pass silently.
 *   2. Each `test` reproduces a specific bug SHAPE that no prior fixture covered:
 *        - Bug #1: a child component constructed INSIDE a structural directive
 *          (lwc:if / for:each) re-run — its ctor field-inits were misreported as
 *          parent-template side effects (globalIsUpdatingTemplate stays raised
 *          across the effect body, which synchronously runs `new Ctor()`).
 *        - Bug #2: a global HTML attribute (`exportparts`/`part`) forwarded to a
 *          child component — vapor's applyChildProp warned "Unknown public
 *          property" instead of reflecting it as an attribute.
 *        - Bug #3: a keyed `for:each` whose items span branches, one of which
 *          carries no key — must not emit "Invalid key value \"undefined\"".
 *
 * Fidelity: components are compiled through `@lwc/compiler` with
 * `enableVaporCompilation` and mounted via the real `createElement`, so the
 * offending code paths (`createComponentInstanceImpl` → `new Ctor()`,
 * `applyChildProp`, `createFor`/`validateKeys`) run for real — mirroring
 * facade.spec.ts.
 */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { transformSync } from '@lwc/compiler';

import * as lwcFacade from '../compat/index';
import * as vaporRuntime from '../index';

// ---------------------------------------------------------------------------
// In-process module loader — evaluates a compiled ESM string by rewiring its
// imports to a provided module map (identical to facade.spec.ts's helper).
// ---------------------------------------------------------------------------
function evalModule(code: string, moduleMap: Record<string, any>): any {
    const exportsObj: any = {};
    const preamble: string[] = [];
    let counter = 0;

    const handleImport = (
        defaultName: string | undefined,
        namespaceName: string | undefined,
        named: string | undefined,
        source: string
    ): string => {
        const localKey = `__mod_${counter++}`;
        preamble.push(`const ${localKey} = __modules[${JSON.stringify(source)}];`);
        if (namespaceName) {
            preamble.push(`const ${namespaceName} = ${localKey};`);
        }
        if (defaultName) {
            preamble.push(
                `const ${defaultName} = (${localKey} && '__esModule' in ${localKey}) ? ${localKey}.default : (${localKey}.default ?? ${localKey});`
            );
        }
        if (named) {
            for (const spec of named.split(',')) {
                const trimmed = spec.trim();
                if (!trimmed) continue;
                const [orig, alias] = trimmed.split(/\s+as\s+/).map((s: string) => s.trim());
                preamble.push(`const ${alias || orig} = ${localKey}[${JSON.stringify(orig)}];`);
            }
        }
        return '';
    };

    let body = code;
    body = body.replace(
        /import\s*\*\s*as\s+([\w$]+)\s+from\s*['"]([^'"]+)['"];?/g,
        (_m, ns, source) => handleImport(undefined, ns, undefined, source)
    );
    body = body.replace(
        /import\s+(?:([\w$]+)\s*(?:,\s*)?)?(?:\{([^}]*)\})?\s*from\s*['"]([^'"]+)['"];?/g,
        (_m, defaultName, named, source) => handleImport(defaultName, undefined, named, source)
    );
    body = body.replace(/import\s*['"]([^'"]+)['"];?/g, '');

    let defaultFnName: string | null = null;
    body = body.replace(/export\s+default\s+function\s+([\w$]+)/g, (_m, name) => {
        defaultFnName = name;
        return `function ${name}`;
    });
    body = body.replace(/export\s+default\s+/g, '__exports.default = ');
    body = body.replace(/export\s+function\s+([\w$]+)/g, '__exports.$1 = function $1');
    if (defaultFnName) {
        body += `\n__exports.default = ${defaultFnName};`;
    }

    const src = `${preamble.join('\n')}\n${body}\nreturn __exports;`;
    const fn = new Function('__modules', '__exports', src);
    return fn(moduleMap, exportsObj);
}

/**
 * Compiles a component (JS + HTML) with the vapor flag and returns its ctor.
 * `childModules` maps a bare module specifier (e.g. `x/child`) to an already
 * compiled ctor so a parent template can render `<x-child>`.
 */
function compileComponent(
    js: string,
    html: string,
    name: string,
    childModules: Record<string, any> = {}
) {
    const compiledTemplate = transformSync(html, `${name}.html`, {
        name,
        namespace: 'x',
        apiVersion: 64,
        enableVaporCompilation: true,
    });
    const compiledJs = transformSync(js, `${name}.js`, {
        name,
        namespace: 'x',
        apiVersion: 64,
        enableVaporCompilation: true,
    });

    const templateModule = evalModule(compiledTemplate.code, {
        '@lwc/engine-vapor': vaporRuntime,
        [`./${name}.css`]: { default: [] },
        [`./${name}.scoped.css?scoped=true`]: { default: [] },
        // The TEMPLATE is what imports a child custom element
        // (`import _xChild from "x/child"`), so child ctors must resolve here.
        ...childModules,
    });

    const jsModule = evalModule(compiledJs.code, {
        lwc: lwcFacade,
        [`./${name}.html`]: templateModule,
        // A parent's JS `import Child from 'x/child'` may also resolve here.
        ...childModules,
    });

    return jsModule.default;
}

// ---------------------------------------------------------------------------
// Console guard: fail the test on any UNEXPECTED [LWC error]/[LWC warn].
// This is the accountability that the vitest config chain lacks globally.
// Returns a disposer that restores console and asserts nothing leaked.
// ---------------------------------------------------------------------------
let errorSpy: ReturnType<typeof vi.spyOn>;
let warnSpy: ReturnType<typeof vi.spyOn>;

function messageOf(args: unknown[]): string {
    // logVaporError/logForError pass an Error object to console.error/warn.
    const first = args[0];
    if (first instanceof Error) return first.message;
    return args.map(String).join(' ');
}

beforeEach(() => {
    document.body.innerHTML = '';
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
});

/**
 * Fail the current test if ANY `[LWC error]`/`[LWC warn]` diagnostic reached the
 * console. This is the accountability the vitest config chain lacks globally — a
 * regression of any of the three bugs re-emits its diagnostic, which this catches.
 * Call at the end of each test (after the DOM assertions).
 */
function assertNoDiagnostics(): void {
    const errors = errorSpy.mock.calls.map(messageOf);
    const warns = warnSpy.mock.calls.map(messageOf);
    expect({ errors, warns }, `Unexpected LWC console diagnostics leaked`).toEqual({
        errors: [],
        warns: [],
    });
}

describe('vapor regression: constructor side-effect false positive (Bug #1)', () => {
    test('a child constructed inside an lwc:if re-run does not log a side-effect error', async () => {
        // Child assigns a @track / private field in its constructor — ordinary
        // instance setup. Before the fix, doing so while the PARENT's template
        // effect was updating (the lwc:if flip synchronously constructs the
        // child) logged "Updating the template ... has side effects on the state".
        const Child = compileComponent(
            `import { LightningElement, track } from 'lwc';
             export default class extends LightningElement {
               @track _src = 'initial';
               _iconName = 'utility:search';
               get src() { return this._src; }
             }`,
            `<template><span>{src}</span></template>`,
            'child'
        );

        const Parent = compileComponent(
            `import { LightningElement, api, track } from 'lwc';
             import Child from 'x/child';
             export default class extends LightningElement {
               @track show = false;
               // Public method flips INTERNAL reactive state — the flip re-runs the
               // structural (lwc:if) effect, which synchronously constructs <x-child>.
               @api reveal() { this.show = true; }
             }`,
            `<template>
               <template lwc:if={show}>
                 <x-child></x-child>
               </template>
             </template>`,
            'parent',
            { 'x/child': { default: Child } }
        );

        const el: any = lwcFacade.createElement('x-parent', { is: Parent });
        document.body.appendChild(el);
        // Flip the lwc:if TRUE from inside — re-runs the parent's structural
        // effect, which synchronously constructs <x-child> (the Bug #1 window).
        el.reveal();
        await Promise.resolve();
        await Promise.resolve();

        expect(el.shadowRoot.querySelector('x-child')).toBeTruthy();
        // Pre-fix: logged "Updating the template ... has side effects on ..._src".
        assertNoDiagnostics();
    });

    test('a child constructed inside a for:each iteration does not log a side-effect error', async () => {
        const Child = compileComponent(
            `import { LightningElement, api, track } from 'lwc';
             export default class extends LightningElement {
               @api item;
               @track _label = 'row';
               get label() { return this._label; }
             }`,
            `<template><span>{label}</span></template>`,
            'row'
        );

        const Parent = compileComponent(
            `import { LightningElement, api, track } from 'lwc';
             import Row from 'x/row';
             export default class extends LightningElement {
               @track items = [];
               // Public method mutates INTERNAL reactive state — populating the
               // for:each synchronously constructs each <x-row> mid-effect.
               @api fill() { this.items = [{ id: 1 }, { id: 2 }, { id: 3 }]; }
             }`,
            `<template>
               <template for:each={items} for:item="it">
                 <x-row key={it.id} item={it}></x-row>
               </template>
             </template>`,
            'list',
            { 'x/row': { default: Child } }
        );

        const el: any = lwcFacade.createElement('x-list', { is: Parent });
        document.body.appendChild(el);
        el.fill();
        await Promise.resolve();
        await Promise.resolve();

        expect(el.shadowRoot.querySelectorAll('x-row').length).toBe(3);
        // Pre-fix: logged a side-effect error per row (._label / item).
        assertNoDiagnostics();
    });
});

describe('vapor regression: exportparts / global attribute on a child (Bug #2)', () => {
    test('forwarding exportparts to a child component does not warn "Unknown public property"', async () => {
        const Child = compileComponent(
            `import { LightningElement } from 'lwc';
             export default class extends LightningElement {}`,
            `<template><span part="inner">x</span></template>`,
            'parted'
        );

        const Parent = compileComponent(
            `import { LightningElement } from 'lwc';
             import Parted from 'x/parted';
             export default class extends LightningElement {}`,
            `<template>
               <x-parted exportparts="inner"></x-parted>
             </template>`,
            'host',
            { 'x/parted': { default: Child } }
        );

        const el: any = lwcFacade.createElement('x-host', { is: Parent });
        document.body.appendChild(el);
        await Promise.resolve();

        const child = el.shadowRoot.querySelector('x-parted');
        expect(child).toBeTruthy();
        // The global attribute must reflect as an ATTRIBUTE, not warn as a prop.
        expect(child.getAttribute('exportparts')).toBe('inner');
        // Pre-fix: warned `Unknown public property "exportparts" of <x-parted>`.
        assertNoDiagnostics();
    });
});

describe('vapor regression: keyed for:each with a keyless branch (Bug #3)', () => {
    // This is the OSS-catchable slice of Bug #3: the engine must not emit
    // "Invalid key value \"undefined\"" and must render distinct rows when a
    // keyed for:each spans a branch that supplies a key and one that does not,
    // provided every rendered item DOES carry a defined key. (The core-side
    // linkify.ts fix is what guarantees the text branch supplies one.)
    test('every item carrying a defined key renders without an Invalid-key error', async () => {
        const Parent = compileComponent(
            `import { LightningElement, track } from 'lwc';
             export default class extends LightningElement {
               // Mirrors linkify's Part[] AFTER the fix: text parts carry a key too.
               @track parts = [
                 { isText: true, value: 'hello ', key: 'text-0' },
                 { isLink: true, value: 'sf.com', key: 'sf.com-0' },
                 { isText: true, value: ' world', key: 'text-tail-1' },
               ];
             }`,
            `<template>
               <template for:each={parts} for:item="part">
                 <span key={part.key}>
                   <template lwc:if={part.isLink}>{part.value}!</template>
                   <template lwc:else>{part.value}</template>
                 </span>
               </template>
             </template>`,
            'formatted'
        );

        const el: any = lwcFacade.createElement('x-formatted', { is: Parent });
        document.body.appendChild(el);
        await Promise.resolve();

        const spans = el.shadowRoot.querySelectorAll('span');
        expect(spans.length).toBe(3);
        expect(el.shadowRoot.textContent).toContain('hello');
        expect(el.shadowRoot.textContent).toContain('world');
        // Pre-fix (keyless text branch): logged `Invalid key value "undefined"`.
        assertNoDiagnostics();
    });
});
