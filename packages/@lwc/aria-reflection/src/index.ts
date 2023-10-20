/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Minimal polyfill of ARIA string reflection, plus some non-standard ARIA props
// Taken from https://github.com/salesforce/lwc/blob/44a01ef/packages/%40lwc/shared/src/aria.ts#L22-L70
// This is designed for maximum backwards compatibility on LEX - it should never change.
// We deliberately don't import from @lwc/shared because that would make this code less portable.
const ARIA_PROPERTIES = [
    'ariaActiveDescendant',
    'ariaAtomic',
    'ariaAutoComplete',
    'ariaBusy',
    'ariaChecked',
    'ariaColCount',
    'ariaColIndex',
    'ariaColSpan',
    'ariaControls',
    'ariaCurrent',
    'ariaDescribedBy',
    'ariaDetails',
    'ariaDisabled',
    'ariaErrorMessage',
    'ariaExpanded',
    'ariaFlowTo',
    'ariaHasPopup',
    'ariaHidden',
    'ariaInvalid',
    'ariaKeyShortcuts',
    'ariaLabel',
    'ariaLabelledBy',
    'ariaLevel',
    'ariaLive',
    'ariaModal',
    'ariaMultiLine',
    'ariaMultiSelectable',
    'ariaOrientation',
    'ariaOwns',
    'ariaPlaceholder',
    'ariaPosInSet',
    'ariaPressed',
    'ariaReadOnly',
    'ariaRelevant',
    'ariaRequired',
    'ariaRoleDescription',
    'ariaRowCount',
    'ariaRowIndex',
    'ariaRowSpan',
    'ariaSelected',
    'ariaSetSize',
    'ariaSort',
    'ariaValueMax',
    'ariaValueMin',
    'ariaValueNow',
    'ariaValueText',
    'role',
];

for (const prop of ARIA_PROPERTIES) {
    const attribute = prop.replace(/^aria/, 'aria-').toLowerCase(); // e.g. ariaPosInSet => aria-posinset

    if (!Object.getOwnPropertyDescriptor(Element.prototype, prop)) {
        Object.defineProperty(Element.prototype, prop, {
            get() {
                return this.getAttribute(attribute);
            },
            set(value) {
                // Per the spec, only null is treated as removing the attribute. However, Chromium/WebKit currently
                // differ from the spec and allow undefined as well. Here, we follow the spec, as well as
                // our historical behavior. See: https://github.com/w3c/aria/issues/1858
                if (value === null) {
                    this.removeAttribute(attribute);
                } else {
                    this.setAttribute(attribute, value);
                }
            },
            // configurable and enumerable to allow it to be overridden – this mimics Safari's/Chrome's behavior
            configurable: true,
            enumerable: true,
        });
    }
}
