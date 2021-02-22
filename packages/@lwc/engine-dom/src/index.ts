/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Polyfills ---------------------------------------------------------------------------------------
import './polyfills/aria-properties/main';

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
    registerComponent,
    registerDecorators,
    sanitizeAttribute,
    sanitizeHtmlContent,
    getComponentDef,
    isComponentConstructor,
    swapComponent,
    swapStyle,
    swapTemplate,
    __unstable__ProfilerControl,
} from '@lwc/engine-core';

// Engine-dom public APIs --------------------------------------------------------------------------
export { deprecatedBuildCustomElementConstructor as buildCustomElementConstructor } from './apis/build-custom-element-constructor';
export { createElement } from './apis/create-element';
export { getComponentConstructor } from './apis/get-component-constructor';
export { isNodeFromTemplate } from './apis/is-node-from-template';
export { LightningElement } from './apis/lightning-element';
