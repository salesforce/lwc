/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// library to control node insertion and removal, it
// must run first...
import '@lwc/node-reactions';

// Polyfills
import '../polyfills/proxy-concat/main';
import '../polyfills/aria-properties/main';
// TODO: this should not be included here in the future
import '@lwc/synthetic-shadow';

export { createElement } from './upgrade';
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
export { default as readonly } from './decorators/readonly';
export { default as wire } from './decorators/wire';
export { default as decorate } from './decorators/decorate';
export { buildCustomElementConstructor } from './wc';

// Deprecated APIs
export { BaseLightningElement as Element } from './base-lightning-element';
