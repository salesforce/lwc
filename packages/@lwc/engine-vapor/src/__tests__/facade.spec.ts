/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 *
 * Facade-level integration: compile a full component (JS class + template)
 * through @lwc/compiler with the vapor flag, wire the compiled modules together
 * against the vapor `lwc` facade, mount via createElement, and assert real DOM
 * behavior. This mirrors what the WTR integration suite does, but in-process.
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { transformSync } from '@lwc/compiler';

import * as lwcFacade from '../compat/index';
import * as vaporRuntime from '../index';

/**
 * Evaluates a compiled ESM module string by rewriting its imports to pull from
 * the provided module map, then running it through `new Function`.
 */
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
    // `import * as NS from 'src'`
    body = body.replace(
        /import\s*\*\s*as\s+([\w$]+)\s+from\s*['"]([^'"]+)['"];?/g,
        (_m, ns, source) => handleImport(undefined, ns, undefined, source)
    );
    // `import Default, { named } from 'src'` / `import Default from 'src'` /
    // `import { named } from 'src'`
    body = body.replace(
        /import\s+(?:([\w$]+)\s*(?:,\s*)?)?(?:\{([^}]*)\})?\s*from\s*['"]([^'"]+)['"];?/g,
        (_m, defaultName, named, source) => handleImport(defaultName, undefined, named, source)
    );
    // Side-effect import: `import 'src';`
    body = body.replace(/import\s*['"]([^'"]+)['"];?/g, '');

    // `export default function NAME(...)` -> keep as a declaration (so later
    // references like `NAME.stylesheets = ...` resolve) and assign the default
    // export at the end.
    let defaultFnName: string | null = null;
    body = body.replace(/export\s+default\s+function\s+([\w$]+)/g, (_m, name) => {
        defaultFnName = name;
        return `function ${name}`;
    });
    // Any other `export default <expr>`.
    body = body.replace(/export\s+default\s+/g, '__exports.default = ');
    // named export of a function declaration
    body = body.replace(/export\s+function\s+([\w$]+)/g, '__exports.$1 = function $1');
    if (defaultFnName) {
        body += `\n__exports.default = ${defaultFnName};`;
    }

    const src = `${preamble.join('\n')}\n${body}\nreturn __exports;`;

    const fn = new Function('__modules', '__exports', src);
    return fn(moduleMap, exportsObj);
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

    // The template module imports from '@lwc/engine-vapor' and (when compiled
    // with a name) its co-located stylesheet `./<name>.css`. Provide an empty
    // stylesheet array for the latter.
    const templateModule = evalModule(compiledTemplate.code, {
        '@lwc/engine-vapor': vaporRuntime,
        [`./${name}.css`]: { default: [] },
        [`./${name}.scoped.css?scoped=true`]: { default: [] },
    });

    // The JS module imports from 'lwc' (the facade) and './<name>.html' (template).
    const jsModule = evalModule(compiledJs.code, {
        lwc: lwcFacade,
        [`./${name}.html`]: templateModule,
    });

    return jsModule.default;
}

describe('vapor facade integration', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('renders a static component', () => {
        const Ctor = compileComponent(
            `import { LightningElement } from 'lwc';
             export default class extends LightningElement {}`,
            `<template><div>hello vapor</div></template>`,
            'static'
        );
        const el = lwcFacade.createElement('x-static', { is: Ctor });
        document.body.appendChild(el);
        expect(el.shadowRoot!.textContent).toContain('hello vapor');
    });

    // Post-mount re-renders are async/batched (engine-core parity — a mutation is
    // applied to the DOM on the next microtask), so assertions after a mutation
    // `await Promise.resolve()` first.
    test('renders reactive interpolation and updates on prop change', async () => {
        const Ctor = compileComponent(
            `import { LightningElement, api } from 'lwc';
             export default class extends LightningElement {
               @api name = 'world';
             }`,
            `<template><div>{name}</div></template>`,
            'greeting'
        );
        const el: any = lwcFacade.createElement('x-greeting', { is: Ctor });
        document.body.appendChild(el);
        expect(el.shadowRoot.textContent).toContain('world');

        el.name = 'salesforce';
        await Promise.resolve();
        expect(el.shadowRoot.textContent).toContain('salesforce');
    });

    test('handles events that mutate tracked state', async () => {
        const Ctor = compileComponent(
            `import { LightningElement, track } from 'lwc';
             export default class extends LightningElement {
               @track count = 0;
               increment() { this.count++; }
             }`,
            `<template><button onclick={increment}>{count}</button></template>`,
            'counter'
        );
        const el: any = lwcFacade.createElement('x-counter', { is: Ctor });
        document.body.appendChild(el);
        const button = el.shadowRoot.querySelector('button');
        expect(button.textContent).toContain('0');

        button.click();
        await Promise.resolve();
        expect(button.textContent).toContain('1');
        button.click();
        await Promise.resolve();
        expect(button.textContent).toContain('2');
    });

    test('computed getter reacts to its underlying field', async () => {
        const Ctor = compileComponent(
            `import { LightningElement, api } from 'lwc';
             export default class extends LightningElement {
               @api first = 'Ada';
               get loud() { return this.first.toUpperCase(); }
             }`,
            `<template><span>{loud}</span></template>`,
            'computed'
        );
        const el: any = lwcFacade.createElement('x-computed', { is: Ctor });
        document.body.appendChild(el);
        expect(el.shadowRoot.textContent).toContain('ADA');

        el.first = 'Grace';
        await Promise.resolve();
        expect(el.shadowRoot.textContent).toContain('GRACE');
    });
});
