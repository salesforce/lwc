/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../../main';

describe('modules/computed-style-attr', () => {
    it('should add style to the element', () => {
        const tmpl = compileTemplate(`
            <template>
                <div style="display: inline"></div>
            </template>
        `);
        class Component extends LightningElement {
            render() {
                return tmpl;
            }
        }

        const elm = createElement('x-cmp', { is: Component });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('div').style.display).toBe('inline');
    });

    it('should patch style to the element', () => {
        const tmpl = compileTemplate(`
            <template>
                <div style={dynamicStyle}></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            counter = 0;

            get dynamicStyle() {
                return this.counter % 2 ? 'display: block' : 'display: inline';
            }

            render() {
                return tmpl;
            }
        }
        MyComponent.publicProps = {
            counter: 1,
        };

        const elm = createElement('x-cmp', { is: MyComponent });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.querySelector('div').style.display).toBe('inline');

        elm.counter++;
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('div').style.display).toBe('block');
        });
    });
});
