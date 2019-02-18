/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement, LightningElement } from '../main';

describe('issue #180', () => {
    it('should support data-foo attribute', () => {
        class MyComponent extends LightningElement {
            connectedCallback() {
                expect(this.getAttribute('data-foo')).toBe('miami');
            }
        }
        const elm = createElement('x-foo', { is: MyComponent });
        elm.setAttribute('data-foo', 'miami');
        document.body.appendChild(elm);
        expect(elm.getAttribute('data-foo')).toBe('miami');
    });
});
