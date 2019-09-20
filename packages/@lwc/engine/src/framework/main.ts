/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Polyfills
import '../polyfills/proxy-concat/main';
import '../polyfills/aria-properties/main';

// TODO: #1296 - Revisit these exports and figure out a better separation
export { createElement } from './upgrade';
export { createContextProvider } from './context-provider';
export { getComponentDef, isComponentConstructor, getComponentConstructor } from './def';
export { BaseLightningElement as LightningElement } from './base-lightning-element';
export { register } from './services';
export { unwrap } from './membrane';
export { registerTemplate, sanitizeAttribute } from './secure-template';
export { registerComponent } from './component';
export { registerDecorators } from './decorators/register';
export { isNodeFromTemplate } from './vm';

export { default as api } from './decorators/api';
export { default as track } from './decorators/track';
export { default as wire } from './decorators/wire';

export { readonly } from './readonly';
export { buildCustomElementConstructor } from './wc';

export { setFeatureFlag, setFeatureFlagForTest } from '@lwc/features';
