/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { htmlPropertyToAttribute } from '../html-attributes';

describe('htmlPropertyToAttribute', () => {
    test.each([
        // Standard attribute mapping
        ['foo', 'foo'],
        ['fooBar', 'foo-bar'],
        ['fooBarBaz', 'foo-bar-baz'],
        ['FooBar', '-foo-bar'],

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
    ])('htmlPropertyToAttribute("%s") returns "%s"', (prop, attr) => {
        expect(htmlPropertyToAttribute(prop)).toEqual(attr);
    });
});
