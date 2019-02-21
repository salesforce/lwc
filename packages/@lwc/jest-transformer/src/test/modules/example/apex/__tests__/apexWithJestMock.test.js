/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement } from 'lwc';
import Apex from 'example/apex';
import { getSObjectValue } from '@salesforce/apex';

jest.mock(
    '@salesforce/apex',
    () => {
        return {
            getSObjectValue: jest.fn(),
        };
    },
    { virtual: true }
);

afterEach(() => {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
});

describe('example-apex', () => {
    it('allows per-test mocking of @salesforce/apex.getSObjectValue', () => {
        const element = createElement('example-apex', { is: Apex });
        document.body.appendChild(element);
        element.callGetSObjectValue();
        expect(getSObjectValue).toHaveBeenCalledWith('from test');
    });
});
