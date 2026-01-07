/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { create, forEach, StringReplace, StringToLowerCase } from './language';

/**
 * According to the following list, there are 48 aria attributes of which two (ariaDropEffect and
 * ariaGrabbed) are deprecated:
 * https://www.w3.org/TR/wai-aria-1.1/#x6-6-definitions-of-states-and-properties-all-aria-attributes
 *
 * The above list of 46 aria attributes is consistent with the following resources:
 * https://github.com/w3c/aria/pull/708/files#diff-eacf331f0ffc35d4b482f1d15a887d3bR11060
 * https://wicg.github.io/aom/spec/aria-reflection.html
 *
 * NOTE: If you update this list, please update test files that implicitly reference this list!
 * Searching the codebase for `aria-flowto` and `ariaFlowTo` should be good enough to find all usages.
 */
const AriaPropertyNames = [
    'ariaActiveDescendant',
    'ariaAtomic',
    'ariaAutoComplete',
    'ariaBusy',
    'ariaChecked',
    'ariaColCount',
    'ariaColIndex',
    'ariaColIndexText',
    'ariaColSpan',
    'ariaControls',
    'ariaCurrent',
    'ariaDescribedBy',
    'ariaDescription',
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
    'ariaRowIndexText',
    'ariaRowSpan',
    'ariaSelected',
    'ariaSetSize',
    'ariaSort',
    'ariaValueMax',
    'ariaValueMin',
    'ariaValueNow',
    'ariaValueText',
    'ariaBrailleLabel',
    'ariaBrailleRoleDescription',
    'role',
] as const;

type AriaProperty = (typeof AriaPropertyNames)[number];

export type AccessibleElementProperties = {
    [Prop in AriaProperty]: string | null;
};

type AriaPropToAttrMap = {
    [Prop in AriaProperty]: Prop extends `aria${infer S}` ? `aria-${Lowercase<S>}` : Prop;
};

type AriaAttribute = AriaPropToAttrMap[AriaProperty];

type AriaAttrToPropMap = {
    [Prop in AriaProperty as AriaPropToAttrMap[Prop]]: Prop;
};

const { AriaAttrNameToPropNameMap, AriaPropNameToAttrNameMap } = /*@__PURE__*/ (() => {
    const AriaAttrNameToPropNameMap: AriaAttrToPropMap = create(null);
    const AriaPropNameToAttrNameMap: AriaPropToAttrMap = create(null);

    // Synthetic creation of all AOM property descriptors for Custom Elements
    forEach.call(AriaPropertyNames, (propName) => {
        const attrName = StringToLowerCase.call(
            StringReplace.call(propName, /^aria/, () => 'aria-')
        ) as AriaAttribute;
        // These type assertions are because the map types are a 1:1 mapping of ariaX to aria-x.
        // TypeScript knows we have one of ariaX | ariaY and one of aria-x | aria-y, and tries to
        // prevent us from doing ariaX: aria-y, but we that it's safe.
        (AriaAttrNameToPropNameMap[attrName] as AriaProperty) = propName;
        (AriaPropNameToAttrNameMap[propName] as AriaAttribute) = attrName;
    });

    return { AriaAttrNameToPropNameMap, AriaPropNameToAttrNameMap };
})();

/**
 *
 * @param attrName
 */
export function isAriaAttribute(attrName: string): boolean {
    return attrName in AriaAttrNameToPropNameMap;
}

// These attributes take either an ID or a list of IDs as values.
// This includes aria-* attributes as well as the special non-ARIA "for" attribute
export const ID_REFERENCING_ATTRIBUTES_SET: Set<string> = /*@__PURE__*/ new Set([
    'aria-activedescendant',
    'aria-controls',
    'aria-describedby',
    'aria-details',
    'aria-errormessage',
    'aria-flowto',
    'aria-labelledby',
    'aria-owns',
    'for',
    'popovertarget',
]);

export { AriaAttrNameToPropNameMap, AriaPropNameToAttrNameMap };
