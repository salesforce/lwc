/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    ArrayFilter,
    ArrayIndexOf,
    create,
    forEach,
    StringReplace,
    StringToLowerCase,
} from './language';

/**
 * According to the following list, there are 48 aria attributes of which two (ariaDropEffect and
 * ariaGrabbed) are deprecated:
 * https://www.w3.org/TR/wai-aria-1.1/#x6-6-definitions-of-states-and-properties-all-aria-attributes
 *
 * The above list of 46 aria attributes is consistent with the following resources:
 * https://github.com/w3c/aria/pull/708/files#diff-eacf331f0ffc35d4b482f1d15a887d3bR11060
 * https://wicg.github.io/aom/spec/aria-reflection.html
 */
const ariaPropertyNames = [
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
] as const;

// The list includes prop->attr reflections that we have added in the past,
// but which are not part of AOM ARIA reflection as supported in browsers.
// https://github.com/salesforce/lwc/issues/2733
const nonReflectedAriaPropertyNames = [
    'ariaActiveDescendant',
    'ariaControls',
    'ariaDescribedBy',
    'ariaDetails',
    'ariaErrorMessage',
    'ariaFlowTo',
    'ariaLabelledBy',
    'ariaOwns',
];

const reflectedAriaPropertyNames = /*@__PURE__*/ ArrayFilter.call(
    ariaPropertyNames,
    (item) => ArrayIndexOf.call(nonReflectedAriaPropertyNames, item) === -1
);

export type AccessibleElementProperties = {
    [prop in typeof ariaPropertyNames[number]]: string | null;
};

function createMappings(propertyNames: string[]) {
    const AriaAttrNameToPropNameMap: Record<string, string> = create(null);
    const AriaPropNameToAttrNameMap: Record<string, string> = create(null);

    // Synthetic creation of all AOM property descriptors for Custom Elements
    forEach.call(propertyNames, (propName) => {
        const attrName = StringToLowerCase.call(
            StringReplace.call(propName, /^aria/, () => 'aria-')
        );
        AriaAttrNameToPropNameMap[attrName] = propName;
        AriaPropNameToAttrNameMap[propName] = attrName;
    });

    return [AriaAttrNameToPropNameMap, AriaPropNameToAttrNameMap];
}

export const [AriaAttrNameToPropNameMap, AriaPropNameToAttrNameMap] = /*@__PURE__*/ createMappings(
    ariaPropertyNames as unknown as string[]
);
export const [ReflectedAriaAttrNameToPropNameMap, ReflectedAriaPropNameToAttrNameMap] =
    /*@__PURE__*/ createMappings(reflectedAriaPropertyNames);

export function isAriaAttribute(attrName: string): boolean {
    return attrName in AriaAttrNameToPropNameMap;
}
