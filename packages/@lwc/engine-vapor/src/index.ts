/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Core runtime
export { createVaporComponent, mountComponent, unmountComponent } from './component';
export type { VaporComponentInstance, VaporComponentDef } from './component';

// DOM helpers
export { template } from './dom/template';
export {
    setText,
    setAttr,
    setClass,
    setStyle,
    setProp,
    setDynamicProps,
    setExternalAttr,
    setExternalDynamicProps,
    setHtml,
} from './dom/prop';
export { child, nthChild, next } from './dom/node';
export { on, delegateEvents, delegate, spreadEvents } from './dom/event';
export { insert, insertStatic, remove } from './dom/insert';

// Reactivity
export { renderEffect } from './renderEffect';

// Control flow
export { createIf } from './createIf';
export { createFor, createIterator } from './createFor';

// Slots
export { createSlot, scopedSlot, scopedSlotFragment } from './slot';

// Block types
export type { Block } from './block';
export { VaporFragment, DynamicFragment, firstNode, lastNode } from './block';

// Lifecycle
export { onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onDisconnected } from './lifecycle';

// Directives
export { applyRefs } from './directives/ref';

// `lwc`-compatible facade (LightningElement, createElement, registerComponent,
// decorators, etc.). Exported here so a single built bundle can serve both the
// `@lwc/engine-vapor` runtime imports and the `lwc` module alias in vapor mode.
export {
    LightningElement,
    registerComponent,
    registerDecorators,
    registerTemplate,
    freezeTemplate,
    getComponentDef,
    isComponentConstructor,
    invokeHandler,
    memoEvent,
    api,
    track,
    wire,
    createElement,
    createChildComponent,
    createDynamicComponent,
    setFeatureFlag,
    setFeatureFlagForTest,
    getFeatureFlag,
    unwrap,
    readonly,
    getComponentConstructor,
    isNodeFromTemplate,
    setHooks,
    setTrustedSignalSet,
    setContextKeys,
    setTrustedContextSet,
    createContextProvider,
    swapComponent,
    swapStyle,
    swapTemplate,
    hydrateComponent,
    __unstable__ReportingControl,
    __unstable__ProfilerControl,
    __dangerous_do_not_use_addTrustedContext,
    sanitizeAttribute,
    parseFragment,
    parseSVGFragment,
    isTrustedSignal,
    SignalBaseClass,
    renderer,
    rendererFactory,
} from './compat/index';
