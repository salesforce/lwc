/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { htmlAttributeToProperty, htmlPropertyToAttribute } from '../html-attributes';

const propToAttr = [
    // Standard attribute mapping
    ['foo', 'foo'],
    ['fooBar', 'foo-bar'],
    ['fooBarBaz', 'foo-bar-baz'],
    ['FooBar', '-foo-bar'],

    // Aria attribute mapping
    ['ariaActiveDescendant', 'aria-activedescendant'],
    ['ariaAtomic', 'aria-atomic'],
    ['ariaAutoComplete', 'aria-autocomplete'],
    ['ariaBusy', 'aria-busy'],
    ['ariaChecked', 'aria-checked'],
    ['ariaColCount', 'aria-colcount'],
    ['ariaColIndex', 'aria-colindex'],
    ['ariaColSpan', 'aria-colspan'],
    ['ariaControls', 'aria-controls'],
    ['ariaCurrent', 'aria-current'],
    ['ariaDescribedBy', 'aria-describedby'],
    ['ariaDetails', 'aria-details'],
    ['ariaDisabled', 'aria-disabled'],
    ['ariaErrorMessage', 'aria-errormessage'],
    ['ariaExpanded', 'aria-expanded'],
    ['ariaFlowTo', 'aria-flowto'],
    ['ariaHasPopup', 'aria-haspopup'],
    ['ariaHidden', 'aria-hidden'],
    ['ariaInvalid', 'aria-invalid'],
    ['ariaKeyShortcuts', 'aria-keyshortcuts'],
    ['ariaLabel', 'aria-label'],
    ['ariaLabelledBy', 'aria-labelledby'],
    ['ariaLevel', 'aria-level'],
    ['ariaLive', 'aria-live'],
    ['ariaModal', 'aria-modal'],
    ['ariaMultiLine', 'aria-multiline'],
    ['ariaMultiSelectable', 'aria-multiselectable'],
    ['ariaOrientation', 'aria-orientation'],
    ['ariaOwns', 'aria-owns'],
    ['ariaPlaceholder', 'aria-placeholder'],
    ['ariaPosInSet', 'aria-posinset'],
    ['ariaPressed', 'aria-pressed'],
    ['ariaReadOnly', 'aria-readonly'],
    ['ariaRelevant', 'aria-relevant'],
    ['ariaRequired', 'aria-required'],
    ['ariaRoleDescription', 'aria-roledescription'],
    ['ariaRowCount', 'aria-rowcount'],
    ['ariaRowIndex', 'aria-rowindex'],
    ['ariaRowSpan', 'aria-rowspan'],
    ['ariaSelected', 'aria-selected'],
    ['ariaSetSize', 'aria-setsize'],
    ['ariaSort', 'aria-sort'],
    ['ariaValueMax', 'aria-valuemax'],
    ['ariaValueMin', 'aria-valuemin'],
    ['ariaValueNow', 'aria-valuenow'],
    ['ariaValueText', 'aria-valuetext'],
    ['role', 'role'],

    // Special attribute mapping
    ['accessKey', 'accesskey'],
    ['readOnly', 'readonly'],
    ['tabIndex', 'tabindex'],
    ['bgColor', 'bgcolor'],
    ['colSpan', 'colspan'],
    ['rowSpan', 'rowspan'],
    ['contentEditable', 'contenteditable'],
    ['crossOrigin', 'crossorigin'],
    ['dateTime', 'datetime'],
    ['formAction', 'formaction'],
    ['isMap', 'ismap'],
    ['maxLength', 'maxlength'],
    ['minLength', 'minlength'],
    ['noValidate', 'novalidate'],
    ['useMap', 'usemap'],
    ['htmlFor', 'for'],
];

const attrToProp = propToAttr.map(([prop, attr]) => [attr, prop]);

describe('htmlPropertyToAttribute', () => {
    test.each(propToAttr)('htmlPropertyToAttribute("%s") returns "%s"', (prop, attr) => {
        expect(htmlPropertyToAttribute(prop)).toEqual(attr);
    });
});

describe('htmlAttributeToProperty', () => {
    test.each(attrToProp)('htmlAttributeToProperty("%s") returns "%s"', (attr, prop) => {
        expect(htmlAttributeToProperty(attr)).toEqual(prop);
    });
});
