/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * ACT (Aura Compilation Tooling) template compatibility shim.
 *
 * ACT produces VDOM-style templates with the signature
 * `tmpl($api, $cmp, $slotset, $ctx)` that build a vnode tree using a small `$api`
 * surface (`c`=custom element, `h`=element, `t`=text, `s`=slot, `b`=bind). The
 * vapor runtime has no VDOM; instead we provide an `$api` whose functions build
 * REAL DOM nodes directly (using vapor's child-component + slot primitives), and a
 * vapor-compatible render function that invokes the ACT template and returns the
 * resulting nodes as a vapor Block.
 *
 * This lets the standard `act/` integration specs — which import ACT-compiled
 * component modules — run under vapor.
 */

import type { Block } from '../block';

// Injected from create-element.ts to avoid a circular import
// (lightning-element → act-compat → create-element → lightning-element).
let createChildComponentImpl:
    | ((
          sel: string,
          Ctor: unknown,
          propGetters?: Record<string, () => unknown>,
          slotset?: Record<string, () => unknown>
      ) => HTMLElement | Comment)
    | null = null;
export function setActCreateChildComponent(
    fn: (
        sel: string,
        Ctor: unknown,
        propGetters?: Record<string, () => unknown>,
        slotset?: Record<string, () => unknown>
    ) => HTMLElement | Comment
): void {
    createChildComponentImpl = fn;
}

type Vnode = Node | null;
type ActChild = Vnode | Vnode[];

interface ActElementData {
    attrs?: Record<string, unknown>;
    props?: Record<string, unknown>;
    classMap?: Record<string, boolean>;
    className?: string;
    styleDecls?: Array<[string, string, boolean]>;
    style?: string;
    on?: Record<string, EventListener>;
    key?: unknown;
    slotAssignment?: string;
}

/** An ACT VDOM-style template: 4-arg, references `$api`. */
export type ActTemplate = (
    api: ActApi,
    cmp: object,
    slotset: Record<string, () => unknown> | undefined,
    ctx: Record<string, unknown>
) => ActChild[];

interface ActApi {
    /** custom element */
    c(tag: string, Ctor: unknown, data: ActElementData, children?: ActChild[]): Node;
    /** plain element */
    h(tag: string, data: ActElementData, children?: ActChild[]): Node;
    /** text */
    t(content: unknown): Node;
    /** slot */
    s(
        name: string,
        data: ActElementData,
        fallback: ActChild[],
        slotset: Record<string, () => unknown> | undefined
    ): Node | Node[];
    /** bind an event handler to the component instance */
    b(handler: (...a: unknown[]) => unknown): EventListener;
}

/**
 * Heuristic: an ACT (VDOM) template is a function of arity 4 — `($api, $cmp,
 * $slotset, $ctx)`. Vapor's own compiled render functions are 2-arg `($cmp,
 * $slotset)`. (Vapor templates never declare a 3rd/4th positional param.)
 */
export function isActTemplate(fn: unknown): fn is ActTemplate {
    return typeof fn === 'function' && (fn as { length: number }).length >= 4;
}

function appendChild(parent: Node, child: ActChild | ActChild[]): void {
    if (child == null) return;
    if (Array.isArray(child)) {
        for (const c of child) appendChild(parent, c);
        return;
    }
    parent.appendChild(child);
}

function applyElementData(el: HTMLElement, data: ActElementData): void {
    if (data.attrs) {
        for (const name of Object.keys(data.attrs)) {
            const v = data.attrs[name];
            if (v === false || v == null) continue;
            el.setAttribute(name, v === true ? '' : String(v));
        }
    }
    if (data.props) {
        for (const name of Object.keys(data.props)) {
            (el as unknown as Record<string, unknown>)[name] = data.props[name];
        }
    }
    if (data.className) {
        el.className = data.className;
    }
    if (data.classMap) {
        for (const name of Object.keys(data.classMap)) {
            if (data.classMap[name]) el.classList.add(name);
        }
    }
    if (data.style) {
        el.setAttribute('style', data.style);
    }
    if (data.styleDecls) {
        for (const [prop, value, important] of data.styleDecls) {
            el.style.setProperty(prop, value, important ? 'important' : '');
        }
    }
    if (data.on) {
        for (const type of Object.keys(data.on)) {
            el.addEventListener(type, data.on[type]);
        }
    }
    if (data.slotAssignment !== undefined) {
        el.setAttribute('slot', data.slotAssignment);
    }
}

/**
 * A "dry" (value-only) `$api` used to RE-EVALUATE an ACT template's expressions
 * without building any DOM. Its element/text/slot factories return cheap
 * placeholders; only `c()` records the freshly-computed `props` of each custom
 * element it encounters, IN DOCUMENT ORDER. Re-running the ACT template through
 * this api inside a render effect re-reads the reactive `$cmp.*` expressions (so
 * the effect subscribes to them) and yields their current values. See `c()` in
 * `makeActApi`, which wires the per-prop reactive getters.
 */
function makeDryActApi(cmp: object, sink: ActElementData[]): ActApi {
    const noop = null as unknown as Node;
    return {
        c(_tag, _Ctor, data) {
            // Record this custom element's freshly-evaluated data (its `props` were
            // just re-read from `$cmp` on the current render-effect call stack, so
            // reads are TRACKED and values are current).
            sink.push(data);
            return noop;
        },
        h() {
            return noop;
        },
        t() {
            return noop;
        },
        s() {
            return noop;
        },
        b(handler) {
            return function (this: unknown, event: Event) {
                return handler.call(cmp, event);
            };
        },
    };
}

/**
 * Build the `$api` for an ACT template invocation, bound to the rendering
 * component `cmp`.
 *
 * `recompute` re-runs the ACT template through the dry api (see `makeDryActApi`)
 * and returns the ordered list of custom-element `data` objects, so each child's
 * props can be re-read reactively. `c()` assigns every custom element a
 * document-order index into that list and hands the child a LIVE reactive getter
 * per prop (rather than a dead captured constant) — restoring vapor's per-prop
 * reactivity for ACT-compiled parents.
 */
function makeActApi(cmp: object, recompute: () => ActElementData[]): ActApi {
    // Document-order index of the NEXT custom element `c()` will create. Both the
    // live pass here and the dry recompute pass walk the template identically, so
    // this index aligns with the recompute sink.
    let childIndex = 0;
    return {
        c(tag, Ctor, data, children = []) {
            // Map ACT data → vapor child-component inputs. `props` become LIVE
            // reactive getters that re-evaluate the template expression on each read
            // (so the wireChildProps render effect subscribes to `$cmp.*` and
            // re-applies the prop when it changes); attrs/class/style/on/slot are
            // applied to the host after it is created. Children become the default
            // slot.
            const myIndex = childIndex++;
            const propGetters: Record<string, () => unknown> = {};
            if (data.props) {
                for (const name of Object.keys(data.props)) {
                    // Re-run the template (value-only) and read THIS child's fresh
                    // prop. The recompute reads `$cmp.*` on the caller's (render
                    // effect's) stack, so the effect tracks those reads and re-runs —
                    // and re-applies — when they change.
                    propGetters[name] = () => {
                        const recomputed = recompute();
                        const entry = recomputed[myIndex];
                        // Fall back to the initial value if the recompute pass didn't
                        // reach this child (e.g. it's now behind a falsy conditional).
                        return entry && entry.props ? entry.props[name] : data.props![name];
                    };
                }
            }
            const slotset: Record<string, () => unknown> | undefined =
                children && children.length
                    ? {
                          '': () => {
                              const frag = document.createDocumentFragment();
                              appendChild(frag, children);
                              return Array.from(frag.childNodes) as unknown as Block;
                          },
                      }
                    : undefined;
            const host = createChildComponentImpl!(
                tag,
                Ctor,
                Object.keys(propGetters).length ? propGetters : undefined,
                slotset
            ) as HTMLElement;
            // attrs / classMap / styleDecls / on / slotAssignment apply to the host.
            applyElementData(host, { ...data, props: undefined });
            return host;
        },
        h(tag, data, children = []) {
            const el = document.createElement(tag);
            applyElementData(el, data);
            appendChild(el, children);
            return el;
        },
        t(content) {
            return document.createTextNode(content == null ? '' : String(content));
        },
        s(name, data, fallback, _slotset) {
            // Render a real `<slot>` element (with its name + fallback children) into
            // the shadow tree. The browser projects the host's light-DOM slotted
            // content (which `c()` appended via the child's default/named slotset)
            // into it. This mirrors LWC's native-shadow `<slot>` rendering so tests
            // that inspect `slot.assignedNodes()` work.
            const slot = document.createElement('slot');
            if (name) slot.setAttribute('name', name);
            applyElementData(slot, data);
            appendChild(slot, fallback);
            return slot;
        },
        b(handler) {
            // Bind the handler to the component instance (LWC `api_bind`).
            return function (this: unknown, event: Event) {
                return handler.call(cmp, event);
            };
        },
    };
}

/**
 * Wrap an ACT VDOM template as a vapor render function. Vapor calls
 * `renderFn($cmp, $slotset)`; we invoke the ACT template with the `$api` shim and
 * return its vnode (real-DOM) tree flattened into a vapor Block (an array of
 * Nodes).
 */
export function renderActTemplate(
    tmpl: ActTemplate,
    cmp: object,
    slotset: Record<string, () => unknown> | undefined
): Block {
    const ctx: Record<string, unknown> = {};
    // Re-run the ACT template through the value-only "dry" api to re-read every
    // custom element's props from `$cmp` (in document order). Invoked lazily by the
    // per-prop reactive getters inside a render effect, so those effects subscribe
    // to the `$cmp.*` reads and re-run (re-applying the prop) when they change. The
    // SAME `ctx` is reused so memoized event bindings (`$ctx._mN`) don't re-bind.
    const recompute = (): ActElementData[] => {
        const sink: ActElementData[] = [];
        tmpl(makeDryActApi(cmp, sink), cmp, slotset, ctx);
        return sink;
    };
    const api = makeActApi(cmp, recompute);
    const vnodes = tmpl(api, cmp, slotset, ctx);
    const out: Node[] = [];
    const collect = (child: ActChild | ActChild[]): void => {
        if (child == null) return;
        if (Array.isArray(child)) {
            for (const c of child) collect(c);
            return;
        }
        out.push(child);
    };
    collect(vnodes);
    return out as unknown as Block;
}
