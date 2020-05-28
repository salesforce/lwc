/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export * from './framework/main';

export {
    createContextProvider,
    LightningElement,
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
