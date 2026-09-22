/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 *
 * Regression suite for the construction-vs-lifecycle `this`-identity split
 * (a.k.a. "bug D"). Several base components (lightning/combobox, others sharing
 * the lightning/utilsInternal `privateContext` idiom) do:
 *
 *     constructor()        { super(); setContext(this); }   // WeakMap.set(this)
 *     connectedCallback()  { assertContext(this); }         // WeakMap.has(this)
 *
 * where `setContext`/`assertContext` key a WeakMap BY OBJECT IDENTITY. For that
 * pattern to work, the `this` a subclass observes in its constructor must be the
 * SAME object it observes in connectedCallback (and every other lifecycle hook /
 * method). Vapor wraps each instance in a reactive `$cmp` Proxy that lifecycle
 * hooks run against; this suite pins down that a subclass's `this` is that SAME
 * proxy across construction and the lifecycle, so identity-keyed bookkeeping in
 * user/base-component code holds.
 */
import { describe, test, expect } from 'vitest';
import { transformSync } from '@lwc/compiler';

import * as lwcFacade from '../compat/index';
import * as vaporRuntime from '../index';

// ---------------------------------------------------------------------------
// Minimal in-process module loader — evaluates a compiled ESM string by rewiring
// its imports to a provided module map (mirrors facade.spec.ts's helper).
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
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const evalFn = new Function('__modules', '__exports', src);
    return evalFn(moduleMap, exportsObj);
}

function compileComponent(js: string, html: string, name: string) {
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
    });

    const jsModule = evalModule(compiledJs.code, {
        lwc: lwcFacade,
        [`./${name}.html`]: templateModule,
    });

    return jsModule.default;
}

describe('lifecycle `this`-identity (bug D regression)', () => {
    test('constructor `this` === connectedCallback `this` (WeakMap-by-identity holds)', () => {
        // Reproduces the lightning/utilsInternal privateContext idiom: a WeakMap
        // keyed on the instance is written in the constructor and read in
        // connectedCallback. Before the fix, vapor ran the constructor against the
        // raw instance and connectedCallback against the $cmp proxy, so the read
        // missed and this threw "Invalid `this`."
        const seen = new WeakSet<object>();
        const flags = { connectedRan: false };
        (globalThis as any).__ctxStore = seen;
        (globalThis as any).__ctxFlags = flags;

        const Ctor = compileComponent(
            `import { LightningElement } from 'lwc';
             const store = globalThis.__ctxStore;
             const flags = globalThis.__ctxFlags;
             export default class extends LightningElement {
               constructor() { super(); store.add(this); }
               connectedCallback() {
                 if (!store.has(this)) {
                   throw new Error('Invalid \`this\`. constructor and connectedCallback saw different identities.');
                 }
                 flags.connectedRan = true;
               }
             }`,
            `<template><div>ctx</div></template>`,
            'ctxidentity'
        );

        const el: any = lwcFacade.createElement('x-ctxidentity', { is: Ctor });
        expect(() => document.body.appendChild(el)).not.toThrow();
        // Sanity: connectedCallback actually ran to completion (past the WeakSet
        // identity check) — proving the assertion above wasn't vacuously true.
        expect(flags.connectedRan).toBe(true);

        delete (globalThis as any).__ctxStore;
        delete (globalThis as any).__ctxFlags;
    });

    test('`this` identity is stable across constructor, connectedCallback, renderedCallback, and methods', async () => {
        // Capture the `this` seen at each lifecycle phase and assert they are all
        // the exact same reference.
        const identities: Record<string, unknown> = {};
        (globalThis as any).__ids = identities;

        const Ctor = compileComponent(
            `import { LightningElement } from 'lwc';
             const ids = globalThis.__ids;
             export default class extends LightningElement {
               constructor() { super(); ids.ctor = this; }
               connectedCallback() { ids.connected = this; }
               renderedCallback() { ids.rendered = this; }
               ping() { ids.method = this; }
             }`,
            `<template><button onclick={ping}>go</button></template>`,
            'idstable'
        );

        const el: any = lwcFacade.createElement('x-idstable', { is: Ctor });
        document.body.appendChild(el);
        el.shadowRoot.querySelector('button').click();
        await Promise.resolve();

        expect(identities.ctor).toBeDefined();
        expect(identities.connected).toBe(identities.ctor);
        expect(identities.rendered).toBe(identities.ctor);
        expect(identities.method).toBe(identities.ctor);

        delete (globalThis as any).__ids;
    });

    test('the `this` a subclass sees still passes `instanceof LightningElement` (proxy preserves the prototype chain)', () => {
        // FIX-2 returns a Proxy from the base ctor; a Proxy reflects its target's
        // prototype, so `this instanceof LightningElement` (and `instanceof Subclass`)
        // must remain true — engine-core and user code both rely on this.
        const results: Record<string, unknown> = {};
        (globalThis as any).__instof = results;

        const Ctor = compileComponent(
            `import { LightningElement } from 'lwc';
             const out = globalThis.__instof;
             export default class Sub extends LightningElement {
               constructor() {
                 super();
                 out.isLE = this instanceof LightningElement;
                 out.isSub = this instanceof Sub;
               }
             }`,
            `<template><div>x</div></template>`,
            'instof'
        );

        const el: any = lwcFacade.createElement('x-instof', { is: Ctor });
        document.body.appendChild(el);

        expect(results.isLE).toBe(true);
        expect(results.isSub).toBe(true);

        delete (globalThis as any).__instof;
    });

    test('reactivity still works through the returned proxy (fields written in the ctor re-render)', async () => {
        // The whole reason FIX-2 returns the reactive proxy (rather than making
        // lifecycle hooks run against the raw instance) is that plain-field
        // reactivity is wired through the $cmp set-trap. A field mutated after mount
        // must still re-render the bound text — prove it end-to-end.
        const Ctor = compileComponent(
            `import { LightningElement } from 'lwc';
             export default class extends LightningElement {
               msg = 'init';
               bump() { this.msg = 'updated'; }
             }`,
            `<template><span>{msg}</span><button onclick={bump}>b</button></template>`,
            'reactivethis'
        );

        const el: any = lwcFacade.createElement('x-reactivethis', { is: Ctor });
        document.body.appendChild(el);
        expect(el.shadowRoot.querySelector('span').textContent).toBe('init');

        el.shadowRoot.querySelector('button').click();
        await Promise.resolve();
        await Promise.resolve();

        expect(el.shadowRoot.querySelector('span').textContent).toBe('updated');
    });
});
