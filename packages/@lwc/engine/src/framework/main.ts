/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Public APIs -------------------------------------------------------------------------------------
export { createContextProvider } from './context-provider';
export { BaseLightningElement as LightningElement } from './base-lightning-element';
export { register } from './services';

export { default as api } from './decorators/api';
export { default as track } from './decorators/track';
export { default as wire } from './decorators/wire';
export { readonly } from './readonly';

export { setFeatureFlag, setFeatureFlagForTest } from '@lwc/features';

// Internal APIs used by renderers -----------------------------------------------------------------
export { getComponentInternalDef, setElementProto } from './def';
export { getAttrNameFromPropName, isAttributeLocked } from './attributes';
export {
    createVM,
    connectRootElement,
    disconnectRootElement,
    getAssociatedVMIfPresent,
} from './vm';

// Internal APIs used by compiled code -------------------------------------------------------------
export { registerComponent } from './component';
export { registerTemplate } from './secure-template';
export { registerDecorators } from './decorators/register';

// Mics. internal APIs -----------------------------------------------------------------------------
export { unwrap } from './membrane';
export { sanitizeAttribute } from './secure-template';
export { getComponentDef, isComponentConstructor } from './def';

// Types -------------------------------------------------------------------------------------------
export type { Renderer } from './renderer';
