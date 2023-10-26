/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { htmlPropertyToAttribute, kebabCaseToCamelCase } from '../html-attributes';

type StringPair = [prop: string, attr: string];

const customAttributeMapping = [
    ['foo', 'foo'],
    ['fooBar', 'foo-bar'],
    ['fooBarBaz', 'foo-bar-baz'],
    ['FooBar', '-foo-bar'],
] as StringPair[];

const ariaAttributeMapping = [
    ['ariaAtomic', 'aria-atomic'],
    ['ariaAutoComplete', 'aria-autocomplete'],
    ['ariaBusy', 'aria-busy'],
    ['ariaChecked', 'aria-checked'],
    ['ariaColCount', 'aria-colcount'],
    ['ariaColIndex', 'aria-colindex'],
    ['ariaColIndexText', 'aria-colindextext'],
    ['ariaColSpan', 'aria-colspan'],
    ['ariaCurrent', 'aria-current'],
    ['ariaDescription', 'aria-description'],
    ['ariaDisabled', 'aria-disabled'],
    ['ariaExpanded', 'aria-expanded'],
    ['ariaHasPopup', 'aria-haspopup'],
    ['ariaHidden', 'aria-hidden'],
    ['ariaInvalid', 'aria-invalid'],
    ['ariaKeyShortcuts', 'aria-keyshortcuts'],
    ['ariaLabel', 'aria-label'],
    ['ariaLevel', 'aria-level'],
    ['ariaLive', 'aria-live'],
    ['ariaModal', 'aria-modal'],
    ['ariaMultiLine', 'aria-multiline'],
    ['ariaMultiSelectable', 'aria-multiselectable'],
    ['ariaOrientation', 'aria-orientation'],
    ['ariaPlaceholder', 'aria-placeholder'],
    ['ariaPosInSet', 'aria-posinset'],
    ['ariaPressed', 'aria-pressed'],
    ['ariaReadOnly', 'aria-readonly'],
    ['ariaRelevant', 'aria-relevant'],
    ['ariaRequired', 'aria-required'],
    ['ariaRoleDescription', 'aria-roledescription'],
    ['ariaRowCount', 'aria-rowcount'],
    ['ariaRowIndex', 'aria-rowindex'],
    ['ariaRowIndexText', 'aria-rowindextext'],
    ['ariaRowSpan', 'aria-rowspan'],
    ['ariaSelected', 'aria-selected'],
    ['ariaSetSize', 'aria-setsize'],
    ['ariaSort', 'aria-sort'],
    ['ariaValueMax', 'aria-valuemax'],
    ['ariaValueMin', 'aria-valuemin'],
    ['ariaValueNow', 'aria-valuenow'],
    ['ariaValueText', 'aria-valuetext'],
    ['ariaBrailleLabel', 'aria-braillelabel'],
    ['ariaBrailleRoleDescription', 'aria-brailleroledescription'],
    ['role', 'role'],
] as StringPair[];

// TODO [#2733]: remove non-standard ARIA reflection
const nonStandardAriaMapping = [
    ['ariaActiveDescendant', 'aria-activedescendant'],
    ['ariaControls', 'aria-controls'],
    ['ariaDescribedBy', 'aria-describedby'],
    ['ariaDetails', 'aria-details'],
    ['ariaErrorMessage', 'aria-errormessage'],
    ['ariaFlowTo', 'aria-flowto'],
    ['ariaLabelledBy', 'aria-labelledby'],
    ['ariaOwns', 'aria-owns'],
] as StringPair[];

const specialHtmlMapping = [
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
] as StringPair[];

const attrToProp = ([prop, attr]: StringPair) => [attr, prop];

describe('htmlPropertyToAttribute', () => {
    test.each([
        ...customAttributeMapping,
        ...ariaAttributeMapping,
        ...nonStandardAriaMapping,
        ...specialHtmlMapping,
    ])('htmlPropertyToAttribute("%s") returns "%s"', (prop, attr) => {
        expect(htmlPropertyToAttribute(prop)).toEqual(attr);
    });
});

describe('kebabCaseToCamelCase', () => {
    test.each(customAttributeMapping.map(attrToProp))(
        'kebabCaseToCamelCase("%s") returns "%s"',
        (attr, prop) => {
            expect(kebabCaseToCamelCase(attr)).toEqual(prop);
        }
    );
});
