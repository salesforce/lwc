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
export { getComponentHtmlPrototype } from './def';
export {
    createVM,
    connectRootElement,
    disconnectRootElement,
    getAssociatedVMIfPresent,
} from './vm';

export { hydrateRoot } from './hydration';

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
export { freezeTemplate } from './freeze-template';

// Experimental or Internal APIs
export { getComponentConstructor } from './get-component-constructor';

// Types -------------------------------------------------------------------------------------------
export type {
    ConfigValue as WireConfigValue,
    ContextValue as WireContextValue,
    DataCallback,
    WireAdapter,
    WireAdapterConstructor,
    WireAdapterSchemaValue,
} from './wiring';

// Initialization APIs for the renderer, to be used by engine implementations
export { setDefaultRenderer } from '../renderer';
