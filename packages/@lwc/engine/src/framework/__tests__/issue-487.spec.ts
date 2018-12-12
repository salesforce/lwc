/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../main';

describe('issue 487', () => {
    it('should not throw when setting AOM property on anchor', () => {
        const html = compileTemplate(`
            <template>
                <a></a>
            </template>
        `);
        class MyComponent extends LightningElement {
            setAriaSelected() {
                this.template.querySelector('a').ariaSelected = 'true';
            }
            render() {
                return html;
            }
        }

        MyComponent.publicMethods = ['setAriaSelected'];

        const element = createElement('x-foo', { is: MyComponent }) as HTMLAnchorElement;
        document.body.appendChild(element);
        element.href = 'https://google.com';
        expect(() => {
            element.setAriaSelected();
        }).not.toThrow();
    });
});
