/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, test, expect } from 'vitest';
import { LWC_VERSION } from '@lwc/shared';
import { compileVapor } from '../compile';

// Replace LWC's version with X.X.X so the snapshots don't change on every release bump
// (mirrors template-compiler's fixtures.spec.ts).
function compile(src: string): string {
    return compileVapor(src).code.replace(
        new RegExp(LWC_VERSION.replace(/\./g, '\\.'), 'g'),
        'X.X.X'
    );
}

describe('vapor codegen snapshots', () => {
    test('dynamic text', () => {
        const code = compile(`<template><div>{message}</div></template>`);
        expect(code).toMatchInlineSnapshot(`
          "import { freezeTemplate, nthChild, renderEffect, setText, template } from '@lwc/engine-vapor';

          const t0 = template("<div> </div>");

          export default function render($cmp, $slotset) {
              const n0 = t0();
              const n1 = nthChild(n0, 0);
              renderEffect(() => setText(n1, ($cmp.message)));
              return n0;
              /*LWC compiler vX.X.X*/
          }
          freezeTemplate(render);"
        `);
    });

    test('event handler with class binding', () => {
        const code = compile(
            `<template><button onclick={handleClick} class={btnClass}>label</button></template>`
        );
        expect(code).toMatchInlineSnapshot(`
          "import { delegate, delegateEvents, freezeTemplate, invokeHandler, memoEvent, renderEffect, setClass, template } from '@lwc/engine-vapor';

          const t0 = template("<button>label</button>");

          delegateEvents("click");

          export default function render($cmp, $slotset) {
              const n0 = t0();
              const _h0 = memoEvent($cmp, 0, () => $cmp.handleClick);
              delegate(n0, "click", e => invokeHandler($cmp, _h0, e));
              renderEffect(() => setClass(n0, $cmp.btnClass));
              return n0;
              /*LWC compiler vX.X.X*/
          }
          freezeTemplate(render);"
        `);
    });

    test('list rendering', () => {
        const code = compile(
            `<template><ul><li for:each={items} for:item="item" key={item.id}>static</li></ul></template>`
        );
        expect(code).toMatchInlineSnapshot(`
          "import { createFor, freezeTemplate, insert, nthChild, template } from '@lwc/engine-vapor';

          const t0 = template("<li>static</li>");
          const t1 = template("<ul><!----></ul>");

          export default function render($cmp, $slotset) {
              const n0 = t1();
              const n1 = nthChild(n0, 0);
              const d0 = createFor(
                  () => $cmp.items,
                  (item) => {
                      const n2 = t0();
                      return n2;
                  },
                  (item) => item.id
              );
              insert(d0, n0, n1);
              return n0;
              /*LWC compiler vX.X.X*/
          }
          freezeTemplate(render);"
        `);
    });

    test('conditional rendering', () => {
        const code = compile(`<template><p lwc:if={visible}>Shown</p></template>`);
        expect(code).toMatchInlineSnapshot(`
          "import { createIf, freezeTemplate, template } from '@lwc/engine-vapor';

          const t0 = template("<p>Shown</p>");

          export default function render($cmp, $slotset) {
              const d0 = createIf(
                  () => $cmp.visible,
                  () => {
                      const n0 = t0();
                      return n0;
                  }
              );
              return d0;
              /*LWC compiler vX.X.X*/
          }
          freezeTemplate(render);"
        `);
    });
});
