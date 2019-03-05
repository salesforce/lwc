/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement } from 'lwc';
import ContentAssetUrl from 'example/contentAssetUrl';

jest.mock(
    '@salesforce/contentAssetUrl/mocked',
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

describe('example-content-asset-url', () => {
    it('default snapshot', () => {
        const element = createElement('example-content-asset-url', { is: ContentAssetUrl });
        document.body.appendChild(element);
        expect(element).toMatchSnapshot();
    });

    it('returns default value as import path', () => {
        const element = createElement('example-content-asset-url', { is: ContentAssetUrl });
        document.body.appendChild(element);
        const resourceUrl = document.body.querySelector('.unmockedAsset').textContent;
        expect(resourceUrl).toBe('unmocked');
    });

    it('returns value from mock defined in test file', () => {
        const element = createElement('example-content-asset-url', { is: ContentAssetUrl });
        document.body.appendChild(element);
        const resourceUrl = document.body.querySelector('.mockedAsset').textContent;
        expect(resourceUrl).toBe('value set in test');
    });
});
