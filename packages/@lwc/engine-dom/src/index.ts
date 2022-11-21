/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Polyfills ---------------------------------------------------------------------------------------
import '@lwc/aria-reflection-polyfill';

// Tests -------------------------------------------------------------------------------------------
import './testFeatureFlag.ts';

// Tests -------------------------------------------------------------------------------------------
import './testFeatureFlag.ts';

// DevTools Formatters
import './formatters';

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
    parseFragment,
    parseSVGFragment,
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
export { renderer } from './renderer';
export { rendererFactory } from './renderer-factory';
