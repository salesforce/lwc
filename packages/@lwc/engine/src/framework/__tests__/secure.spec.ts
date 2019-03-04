/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement, LightningElement } from '../main';

describe('secure', () => {
    it('forbidden access to template', () => {
        // We can't use the inline template compiler here
        // since precisely we are trying to test that handcrafted
        // functions throw an exception.
        function html() {
            return [];
        }

        class Foo extends LightningElement {
            render() {
                return html;
            }
        }
        const elm = createElement('x-foo', { is: Foo });
        expect(() => {
            document.body.appendChild(elm);
        }).toThrowError(
            'Invalid template returned by the render() method on [object:vm Foo (1)]. It must return an imported template (e.g.: `import html from "./Foo.html"`)'
        );
    });
});
