/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Public APIs -------------------------------------------------------------------------------------
export { createContextProvider } from './context-provider';
export { LightningElement } from './base-lightning-element';
export { register } from './services';

export { default as api } from './decorators/api';
export { default as track } from './decorators/track';
export { default as wire } from './decorators/wire';
export { readonly } from './readonly';

export { setFeatureFlag, setFeatureFlagForTest } from '@lwc/features';

// Internal APIs used by renderers -----------------------------------------------------------------
export { getComponentInternalDef } from './def';
export {
    createVM,
    connectRootElement,
    disconnectRootElement,
    getAssociatedVMIfPresent,
    hydrateRootElement,
} from './vm';

// Internal APIs used by compiled code -------------------------------------------------------------
export { registerComponent } from './component';
export { registerTemplate } from './secure-template';
export { registerDecorators } from './decorators/register';

// Mics. internal APIs -----------------------------------------------------------------------------
export { unwrap } from './membrane';
export { sanitizeAttribute } from './secure-template';
export { getComponentDef, isComponentConstructor } from './def';
export { profilerControl as __unstable__ProfilerControl } from './profiler';
export { getUpgradableConstructor } from './upgradable-element';
export { swapTemplate, swapComponent, swapStyle } from './hot-swaps';
export { setHooks } from './overridable-hooks';

// Types -------------------------------------------------------------------------------------------
export type {
    ConfigValue as WireConfigValue,
    ContextValue as WireContextValue,
    DataCallback,
    WireAdapter,
    WireAdapterConstructor,
    WireAdapterSchemaValue,
} from './wiring';

export {
    setAssertInstanceOfHTMLElement,
    setAttachShadow,
    setCreateComment,
    setCreateElement,
    setCreateText,
    setDefineCustomElement,
    setDispatchEvent,
    setGetAttribute,
    setGetBoundingClientRect,
    setGetChildNodes,
    setGetChildren,
    setGetClassList,
    setGetCustomElement,
    setGetElementsByClassName,
    setGetElementsByTagName,
    setGetFirstChild,
    setGetFirstElementChild,
    setGetLastChild,
    setGetLastElementChild,
    setGetProperty,
    setHTMLElement,
    setInsert,
    setInsertGlobalStylesheet,
    setInsertStylesheet,
    setIsConnected,
    setIsHydrating,
    setIsNativeShadowDefined,
    setIsSyntheticShadowDefined,
    setNextSibling,
    setQuerySelector,
    setQuerySelectorAll,
    setRemove,
    setRemoveAttribute,
    setRemoveEventListener,
    setSetAttribute,
    setSetCSSStyleProperty,
    setSetProperty,
    setSetText,
    setSsr,
    setAddEventListener,
} from '../renderer';
