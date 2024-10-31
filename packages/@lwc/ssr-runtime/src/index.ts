/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export { ClassList } from './class-list';
export {
    LightningElement,
    LightningElementConstructor,
    SYMBOL__SET_INTERNALS,
    SYMBOL__GENERATE_MARKUP,
} from './lightning-element';
export { mutationTracker } from './mutation-tracker';
// renderComponent is an alias for serverSideRenderComponent
export {
    fallbackTmpl,
    fallbackTmplNoYield,
    GenerateMarkupFn,
    renderAttrs,
    renderAttrsNoYield,
    serverSideRenderComponent,
    serverSideRenderComponent as renderComponent,
} from './render';
export * from './stubs';
export { toIteratorDirective } from './to-iterator-directive';
export { validateStyleTextContents } from './validate-style-text-contents';
export { htmlEscape } from '@lwc/shared';
export { hasScopedStaticStylesheets, renderStylesheets } from './styles';
