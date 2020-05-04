/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import './polyfills/proxy-concat/main';
import './polyfills/aria-properties/main';

export { createElement } from './apis/create-element';
export { isNodeFromTemplate } from './apis/is-node-from-template';
export { getComponentConstructor } from './apis/get-component-constructor';
