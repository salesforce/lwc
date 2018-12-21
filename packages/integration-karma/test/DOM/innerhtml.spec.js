/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createElement, LightningElement } from 'lwc';
import { html } from 'test-utils';

it('should return a empty for a component without slot', () => {
    const tmpl = html`
        <template>
            <div>Content</div>
        </template>
    `;

    class Test extends LightningElement {
        render() {
            return tmpl();
        }
    }

    const element = createElement('x-test', { is: Test });
    document.body.appendChild(element);

    expect(element.innerHTML).toBe('');
});

it('Element.innerHTML', () => {
    const childTmpl = html`
        <template>
            <div>
                Before[
                <slot></slot>
                ]After
            </div>
        </template>
    `;

    class Child extends LightningElement {
        render() {
            return childTmpl();
        }
    }

    const parentTmpl = html`
        <template>
            <x-child>
                <div class="first">
                    Passed Text
                </div>
            </x-child>
        </template>
    `;

    class Parent extends LightningElement {
        render() {
            return parentTmpl({
                'x-child': Child
            });
        }
    }

    const element = createElement('x-parent', { is: Parent });
    document.body.appendChild(element);

    const p = element.shadowRoot.querySelector('x-child');
    expect(p.innerHTML).toBe('<div class="first">Passed Text</div>');
    expect(p.shadowRoot.querySelector('div').innerHTML).toBe('Before[<slot></slot>]After');
});
