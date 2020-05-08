/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement, LightningElement, registerDecorators } from '../../main';
import wire from '../wire';

describe('wire.ts', () => {
    describe('@wire misuse', () => {
        it('should throw when invoking wire without adapter', () => {
            class MyComponent extends LightningElement {
                constructor() {
                    super();
                    wire();
                }
            }
            expect(() => {
                createElement('x-foo', { is: MyComponent });
            }).toThrow('@wire(adapter, config?) may only be used as a decorator.');
        });

        it('should throw if wire adapter is not truthy', () => {
            class MyComponent extends LightningElement {}

            expect(() => {
                registerDecorators(MyComponent, {
                    wire: {
                        foo: {},
                    },
                });
            }).toThrow('Assert Violation: @wire on field "foo": adapter id must be truthy.');
        });
    });
});
