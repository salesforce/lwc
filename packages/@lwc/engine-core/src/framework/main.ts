/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Internal APIs used by renderers -----------------------------------------------------------------
export { getComponentHtmlPrototype } from './def';
export {
    RenderMode,
    ShadowMode,
    connectRootElement,
    createVM,
    disconnectRootElement,
    getAssociatedVMIfPresent,
    computeShadowAndRenderMode,
    runFormAssociatedCallback,
    runFormDisabledCallback,
    runFormResetCallback,
    runFormStateRestoreCallback,
} from './vm';
export { createContextProviderWithRegister } from './wiring';

export { parseFragment, parseSVGFragment } from './template';
export { hydrateRoot } from './hydration';

// Internal APIs used by compiled code -------------------------------------------------------------
export { registerComponent } from './component';
export { registerTemplate } from './secure-template';
export { registerDecorators } from './decorators/register';

// Mics. internal APIs -----------------------------------------------------------------------------
export { BaseBridgeElement } from './base-bridge-element';
export { unwrap } from './membrane';
export { sanitizeAttribute } from './secure-template';
export { getComponentDef, isComponentConstructor } from './def';
export { profilerControl as __unstable__ProfilerControl } from './profiler';
export { reportingControl as __unstable__ReportingControl } from './reporting';
export { swapTemplate, swapComponent, swapStyle } from './hot-swaps';
export { setHooks } from '@lwc/shared';
export { freezeTemplate } from './freeze-template';
export { getComponentAPIVersion } from './component';
export { shouldBeFormAssociated } from './utils';

// Experimental or Internal APIs
export { getComponentConstructor } from './get-component-constructor';

// Types -------------------------------------------------------------------------------------------
export type { RendererAPI, LifecycleCallback } from './renderer';
export type { Template } from './template';
export type {
    ConfigValue as WireConfigValue,
    ContextConsumer as WireContextConsumer,
    ContextProvider as WireContextProvider,
    ContextProviderOptions as WireContextProviderOptions,
    ContextValue as WireContextValue,
    DataCallback as WireDataCallback,
    WireAdapter,
    WireAdapterConstructor,
    WireAdapterSchemaValue,
    WireContextSubscriptionPayload,
    WireContextSubscriptionCallback,
} from './wiring';
export type { FormRestoreState, FormRestoreReason } from './vm';

// Public APIs -------------------------------------------------------------------------------------
export { LightningElement } from './base-lightning-element';

export { default as api } from './decorators/api';
export { default as track } from './decorators/track';
export { default as wire } from './decorators/wire';
export { readonly } from './readonly';

export { setFeatureFlag, setFeatureFlagForTest } from '@lwc/features';
export {
    setContextKeys,
    setTrustedSignalSet,
    setTrustedContextSet,
    addTrustedContext,
    isTrustedSignal,
} from '@lwc/shared';
export type { Stylesheet, Stylesheets } from '@lwc/shared';

export { SignalBaseClass } from '@lwc/signals';
