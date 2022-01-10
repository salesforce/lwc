/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// Polyfills ---------------------------------------------------------------------------------------
import './polyfills';

// Renderer initialization -------------------------------------------------------------------------
import './initializeRenderer';

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
    setHooks,
    getComponentDef,
    isComponentConstructor,
} from '@lwc/engine-core';

// Engine-server public APIs -----------------------------------------------------------------------
export { renderComponent } from './apis/render-component';
export { LightningElement } from './apis/lightning-element';
