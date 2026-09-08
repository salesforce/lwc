/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export const enum IRNodeTypes {
    ROOT,
    BLOCK,
    SET_PROP,
    SET_ATTR,
    SET_CLASS,
    SET_STYLE,
    SET_TEXT,
    SET_EVENT,
    SET_DYNAMIC_PROPS,
    SET_HTML,
    LWC_ON,
    IF,
    FOR,
    SLOT,
    COMPONENT,
    REF,
}

export interface BaseIR {
    type: IRNodeTypes;
}

export interface RootIR extends BaseIR {
    type: IRNodeTypes.ROOT;
    templates: string[];
    block: BlockIR;
    /** The template's authored render mode (`lwc:render-mode`); 'light' or 'shadow'. */
    renderMode: 'light' | 'shadow';
    /** True when any `<use href>`/`<use xlink:href>` emitted a `sanitizeAttribute`
     *  call, so codegen must `import { sanitizeAttribute } from 'lwc'`. */
    usesSanitizeAttribute?: boolean;
}

/**
 * Describes how to reach a node from the block's root node `n0`.
 * An empty path means the node IS the root. Otherwise it is a sequence of
 * accessors applied left-to-right, e.g. [{kind:'child'}, {kind:'next'}] means
 * `next(child(n0))`.
 */
export interface NodeRef {
    varName: string;
    path: Accessor[];
}

export type Accessor = { kind: 'child' } | { kind: 'next' } | { kind: 'nthChild'; index: number };

export interface BlockIR extends BaseIR {
    type: IRNodeTypes.BLOCK;
    /** Index into the root `templates` array; -1 if the block has no static template. */
    templateIndex: number;
    /**
     * True when the static template has more than one top-level node. In that
     * case the template factory returns a cloned DocumentFragment, the block root
     * variable is that fragment, and top-level nodes are reached via nthChild.
     * The whole fragment is what gets inserted/returned.
     */
    multiRoot?: boolean;
    /** The variable name bound to the cloned template node/fragment, if any. */
    rootVar?: string;
    /** Node references that must be materialized via traversal before operations run. */
    nodeRefs: NodeRef[];
    /** Static, one-time operations (events, refs, control-flow construction). */
    operations: OperationIR[];
    /** Reactive operations, each wrapped in its own renderEffect. */
    effects: EffectIR[];
    /** Variable names returned by this block (the rendered roots, in order). */
    returns: string[];
    /**
     * When set, this block's produced content is a SCOPED slot (a `<template
     * lwc:slot-data="x">` nested inside an lwc:if/elseif/else branch used as slot
     * content). `scopedData` is the data-param name (`x`) which codegen registers as a
     * block LOCAL, and the block's return is wrapped in `scopedSlotFragment((x) => …)`
     * so the runtime tags the produced content as scoped PER BRANCH (a `""` slot fn can
     * be scoped in one branch and standard in another — engine-core resolves scopedness
     * per produced vnode, not per slot fn).
     */
    scopedData?: string;
}

export interface EffectIR {
    operations: OperationIR[];
}

export type OperationIR =
    | SetPropIR
    | SetAttrIR
    | SetClassIR
    | SetStyleIR
    | SetTextIR
    | SetEventIR
    | SetDynamicPropsIR
    | SetHtmlIR
    | LwcOnIR
    | IfIR
    | ForIR
    | SlotIR
    | ComponentIR
    | RefIR;

export interface SetPropIR extends BaseIR {
    type: IRNodeTypes.SET_PROP;
    ref: string;
    prop: string;
    expression: string;
    /** `lwc:external` element: the binding is set as a PROPERTY iff its camelCased
     *  name exists on the element, else as an attribute (engine-core attrs.ts). */
    external?: boolean;
}

export interface SetAttrIR extends BaseIR {
    type: IRNodeTypes.SET_ATTR;
    ref: string;
    attr: string;
    expression: string;
}

export interface SetClassIR extends BaseIR {
    type: IRNodeTypes.SET_CLASS;
    ref: string;
    expression: string;
}

export interface SetStyleIR extends BaseIR {
    type: IRNodeTypes.SET_STYLE;
    ref: string;
    expression: string;
}

export interface SetTextIR extends BaseIR {
    type: IRNodeTypes.SET_TEXT;
    ref: string;
    expression: string;
}

export interface SetDynamicPropsIR extends BaseIR {
    type: IRNodeTypes.SET_DYNAMIC_PROPS;
    ref: string;
    expression: string;
    /** `lwc:external` host: spread props use the external prop/attr heuristic +
     *  unknown-public-property dev warning. */
    external?: boolean;
}

export interface SetHtmlIR extends BaseIR {
    type: IRNodeTypes.SET_HTML;
    ref: string;
    expression: string;
}

export interface LwcOnIR extends BaseIR {
    type: IRNodeTypes.LWC_ON;
    ref: string;
    expression: string;
}

export interface SetEventIR extends BaseIR {
    type: IRNodeTypes.SET_EVENT;
    ref: string;
    event: string;
    handler: string;
    delegated: boolean;
}

/**
 * When a control-flow / component / slot node appears nested inside a static
 * element (rather than at the top level of its block), it must be inserted into
 * that parent element at a specific anchor instead of being returned. `insertInto`
 * carries the parent and anchor refs for that case.
 */
export interface InsertTarget {
    parentRef: string;
    anchorRef: string;
}

export interface IfIR extends BaseIR {
    type: IRNodeTypes.IF;
    varName: string;
    condition: string;
    positive: BlockIR;
    negative?: BlockIR;
    insertInto?: InsertTarget;
    /**
     * ANCHORLESS mode (engine-core parity): when true, this `lwc:if` emits NO
     * persistent `<!---->` delimiter — its bookend pair travels with rendered content
     * and an empty branch contributes ZERO nodes (engine-dom: a false `lwc:if` renders
     * nothing). `nextSiblingRef` resolves the node the content stays before; the list
     * is created via `createIf(cond, pos, neg, () => <nextSiblingRef>)`.
     */
    anchorless?: boolean;
    nextSiblingRef?: string;
    prevSiblingRef?: string;
    /** LEGACY `if:true`/`if:false` — renders NO `<!---->` bookends (engine-dom emits
     *  zero delimiters for them), unlike `lwc:if` which brackets content with a pair. */
    legacy?: boolean;
    /** Suppress this conditional's OWN `<!---->` bookends. Set for legacy if AND for any
     *  if used as SLOT CONTENT (engine-core `flattenFragmentsInChildren` strips a slotted
     *  conditional's bookends at allocation, before distribution — so a slotted `lwc:if`
     *  must not bracket its content; the receiving `<slot>` provides the only pair). */
    noBookends?: boolean;
}

export interface ForIR extends BaseIR {
    type: IRNodeTypes.FOR;
    varName: string;
    source: string;
    item: string;
    index?: string;
    key?: string;
    body: BlockIR;
    /** When set, this is an `iterator:<name>` loop; item is { value, index, first, last }. */
    iterator?: boolean;
    insertInto?: InsertTarget;
    /**
     * ANCHORLESS mode (engine-core `api_iterator` parity): when true, the for:each
     * contributes NO `<!---->` delimiter. `nextSiblingRef` names the runtime expression
     * that resolves the DOM node the list must stay before (the following top-level
     * block's first node), or `null` when the list is the last top-level child (append).
     * The list is inserted via `insert(varName, parentRef)` with no anchor.
     */
    anchorless?: boolean;
    /** Runtime expression (a getter body) resolving the list's next-sibling node, or
     *  the literal `null`. Used only when `anchorless` is set. */
    nextSiblingRef?: string;
    /** Runtime expression resolving the LAST node of the PRECEDING sibling (or `null`),
     *  used to find the real parent in append mode. Used only when `anchorless` is set. */
    prevSiblingRef?: string;
    /** Suppress this list's own bookends (slot-content for:each — engine-core flattens
     *  slotted fragment delimiters at allocation). */
    noBookends?: boolean;
}

export interface SlotIR extends BaseIR {
    type: IRNodeTypes.SLOT;
    varName: string;
    name: string;
    fallback?: BlockIR;
    /** `lwc:slot-bind={expr}` — data this slot exposes to scoped-slot content. */
    bind?: string;
    /** `slot="Y"` on a forwarding `<slot>` — re-tag resolved content with this. */
    forwardAs?: string;
    /** `slot={expr}` — dynamic forwarding target expression (component scope). */
    forwardAsExpr?: string;
    insertInto?: InsertTarget;
}

export interface ComponentIR extends BaseIR {
    type: IRNodeTypes.COMPONENT;
    varName: string;
    tag: string;
    props: Array<{ key: string; expression: string }>;
    /**
     * Static attributes passed as props (e.g. name="foo"). `bool: true` marks a
     * BARE boolean attribute (`<x-child hidden>`), forwarded as boolean `true`
     * rather than the empty string.
     */
    staticProps?: Array<{ key: string; value: string; bool?: boolean }>;
    /** For lwc:is/lwc:dynamic: a component-scope expression yielding the constructor. */
    dynamicCtor?: string;
    /** lwc:spread={obj} expression applied to the component. */
    spread?: string;
    /** lwc:on={obj} expression applied to the component host. */
    lwcOn?: string;
    /** lwc:ref="name" on the component host element. */
    ref?: string;
    /** Event listeners on the component host (`<x-child onclick={fn}>`). */
    events?: Array<{ event: string; handler: string }>;
    /** Slotted content grouped by slot name ('' = default slot). `slotData` is the
     * scoped-slot data param name when the group is a `<template lwc:slot-data>`. */
    slots?: Array<{ name: string; block: BlockIR; slotData?: string }>;
    /**
     * Slotted children whose target slot is a DYNAMIC expression (`slot={expr}`), in
     * DOCUMENT ORDER. Their destination is unknown at compile time, so they are
     * distributed at RUNTIME by evaluating `nameExpr` (engine-core reads the resolved
     * `slot` attribute). Kept ORDERED and separate from `slots` so static-name slotting
     * (and shadow native projection, which relies on document order) is unaffected.
     * `scoped`/`slotData` mark a dynamically-named scoped slot
     * (`<template slot={expr} lwc:slot-data="x">`).
     */
    dynamicSlots?: Array<{
        nameExpr: string;
        block: BlockIR;
        scoped?: boolean;
        slotData?: string;
    }>;
    insertInto?: InsertTarget;
}

export interface RefIR extends BaseIR {
    type: IRNodeTypes.REF;
    ref: string;
    name: string;
}

export type IRNode = RootIR | BlockIR | OperationIR;
