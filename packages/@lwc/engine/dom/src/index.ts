/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Polyfills ---------------------------------------------------------------------------------------
import './polyfills/proxy-concat/main';
import './polyfills/aria-properties/main';

// TODO [#0]: We need to address the problem where engine-core needs the above polyfills.
export {
    createContextProvider,
    register,
    api,
    track,
    wire,
    readonly,
    unwrap,
    buildCustomElementConstructor,
    setFeatureFlag,
    setFeatureFlagForTest,
    registerTemplate,
    registerComponent,
    registerDecorators,
    sanitizeAttribute,
    getComponentDef,
    isComponentConstructor,
} from '../../src';

// Public APIs -------------------------------------------------------------------------------------
export { createElement } from './apis/create-element';
export { getComponentConstructor } from './apis/get-component-constructor';
export { isNodeFromTemplate } from './apis/is-node-from-template';
export { BaseLightningElement as LightningElement } from './apis/lightning-element';
