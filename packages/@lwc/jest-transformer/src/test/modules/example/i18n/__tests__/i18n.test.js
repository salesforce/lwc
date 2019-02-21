/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement } from 'lwc';
import I18n from 'example/i18n';

jest.mock(
    '@salesforce/i18n/dir',
    () => {
        return { default: 'value set in test' };
    },
    { virtual: true }
);

afterEach(() => {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
});

describe('example-i18n', () => {
    it('default snapshot', () => {
        const element = createElement('example-i18n', { is: I18n });
        document.body.appendChild(element);
        expect(element).toMatchSnapshot();
    });

    it('returns default label value as import path', () => {
        const element = createElement('example-i18n', { is: I18n });
        document.body.appendChild(element);
        const targetElement = element.shadowRoot.querySelector('p');
        expect(targetElement.getAttribute('lang')).toBe('en');
        expect(targetElement.textContent).toBe('M/d/yyyy');
    });

    it('returns value from mock defined in test file', () => {
        const element = createElement('example-i18n', { is: I18n });
        document.body.appendChild(element);
        const value = element.shadowRoot.querySelector('p').getAttribute('dir');
        expect(value).toBe('value set in test');
    });

    it.each([
        'locale',
        'timeZone',
        'currency',
        'firstDayOfWeek',
        'dateTime.shortDateFormat',
        'dateTime.mediumDateFormat',
        'dateTime.longDateFormat',
        'dateTime.shortDateTimeFormat',
        'dateTime.mediumDateTimeFormat',
        'dateTime.shortTimeFormat',
        'dateTime.mediumTimeFormat',
        'number.numberFormat',
        'number.percentFormat',
        'number.currencyFormat',
        'number.currencySymbol',
    ])('@salesforce/i18n/%s should be resolved as a default mock value', id => {
        const values = createElement('example-i18n', { is: I18n }).getI18nValues();
        const key = id.split('.').pop();
        expect(values[key]).toBeDefined();
        expect(values[key]).not.toEqual('');
    });
});
