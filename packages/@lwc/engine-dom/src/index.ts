/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Polyfills ---------------------------------------------------------------------------------------
import './polyfills/aria-properties/main';

// Renderer initialization -------------------------------------------------------------------------
import * as renderer from './initializeRenderer';
export { renderer };

// Tests -------------------------------------------------------------------------------------------
import './testFeatureFlag.ts';

// Engine-core public APIs -------------------------------------------------------------------------
export {
    createContextProvider,
    register,
    api,
    track,
    wire,
    readonly,
    unwrap,
    setFeatureFlag,
    setFeatureFlagForTest,
    registerTemplate,
    freezeTemplate,
    registerComponent,
    registerDecorators,
    sanitizeAttribute,
    setHooks,
    getComponentDef,
    isComponentConstructor,
    swapComponent,
    swapStyle,
    swapTemplate,
    getComponentConstructor,
    __unstable__ProfilerControl,
} from '@lwc/engine-core';

// Engine-dom public APIs --------------------------------------------------------------------------
export { hydrateComponent } from './apis/hydrate-component';
export { deprecatedBuildCustomElementConstructor as buildCustomElementConstructor } from './apis/build-custom-element-constructor';
export { createElement } from './apis/create-element';
export { isNodeFromTemplate } from './apis/is-node-from-template';
export { LightningElement } from './apis/lightning-element';
