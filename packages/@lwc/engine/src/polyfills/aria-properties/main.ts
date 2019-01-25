/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { detect } from './detect';
import { patch } from './polyfill';

// Global Aria and Role Properties derived from ARIA and Role Attributes.
// https://wicg.github.io/aom/spec/aria-reflection.html
export const ElementPrototypeAriaPropertyNames = [
    'ariaAutoComplete',
    'ariaChecked',
    'ariaCurrent',
    'ariaDisabled',
    'ariaExpanded',
    'ariaHasPopup',
    'ariaHidden',
    'ariaInvalid',
    'ariaLabel',
    'ariaLevel',
    'ariaMultiLine',
    'ariaMultiSelectable',
    'ariaOrientation',
    'ariaPressed',
    'ariaReadOnly',
    'ariaRequired',
    'ariaSelected',
    'ariaSort',
    'ariaValueMax',
    'ariaValueMin',
    'ariaValueNow',
    'ariaValueText',
    'ariaLive',
    'ariaRelevant',
    'ariaAtomic',
    'ariaBusy',
    'ariaActiveDescendant',
    'ariaControls',
    'ariaDescribedBy',
    'ariaFlowTo',
    'ariaLabelledBy',
    'ariaOwns',
    'ariaPosInSet',
    'ariaSetSize',
    'ariaColCount',
    'ariaColIndex',
    'ariaDetails',
    'ariaErrorMessage',
    'ariaKeyShortcuts',
    'ariaModal',
    'ariaPlaceholder',
    'ariaRoleDescription',
    'ariaRowCount',
    'ariaRowIndex',
    'ariaRowSpan',
    'ariaColSpan',
    'role',
];

/**
 * Note: Attributes aria-dropeffect and aria-grabbed were deprecated in
 * ARIA 1.1 and do not have corresponding IDL attributes.
 */

for (let i = 0, len = ElementPrototypeAriaPropertyNames.length; i < len; i += 1) {
    const propName = ElementPrototypeAriaPropertyNames[i];
    if (detect(propName)) {
        patch(propName);
    }
}
