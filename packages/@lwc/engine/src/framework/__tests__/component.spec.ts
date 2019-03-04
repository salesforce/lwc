/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';

import { createElement, LightningElement } from '../main';
import { getOwnPropertySymbols } from '../../shared/language';
import { getComponentVM } from '../vm';

describe('component', function() {
    describe('public computed props', () => {
        it('should allow public getters', function() {
            class MyComponent extends LightningElement {
                value = 'pancakes';
                get breakfast() {
                    return this.value;
                }
            }
            MyComponent.publicProps = {
                breakfast: {},
            };

            const html = compileTemplate(
                `<template>
                    <x-child></x-child>
                </template>`,
                {
                    modules: { 'x-child': MyComponent },
                }
            );
            class Parent extends LightningElement {
                value = 'salad';
                get lunch() {
                    return this.value;
                }

                render() {
                    return html;
                }
            }
            Parent.publicProps = {
                lunch: {},
            };

            const elm = createElement('x-foo', { is: Parent });
            document.body.appendChild(elm);
            expect(elm.lunch).toBe('salad');
            expect(elm.shadowRoot.querySelector('x-child').breakfast).toBe('pancakes');
        });

        it('should allow calling public getters when element is accessed by querySelector', function() {
            const propVal = { foo: 'bar' };
            class MyChild extends LightningElement {
                m = propVal;
            }
            MyChild.publicProps = {
                m: {},
            };

            const html = compileTemplate(
                `<template>
                    <x-child></x-child>
                </template>`,
                {
                    modules: { 'x-child': MyChild },
                }
            );
            class MyComponent extends LightningElement {
                callChildM() {
                    this.template.querySelector('x-child').m;
                }
                render() {
                    return html;
                }
            }
            MyComponent.publicMethods = ['callChildM'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(() => {
                elm.callChildM();
            }).not.toThrow();
        });

        it('should not allow public getters to be set by owner', function() {
            class MyComponent extends LightningElement {
                get x() {
                    return 1;
                }
            }

            MyComponent.publicProps = {
                x: {},
            };

            const elm = createElement('x-foo', { is: MyComponent });
            // x can't be set via props, only read via getter
            expect(() => (elm.x = 1)).toThrow();
        });

        it('should be render reactive', function() {
            const html = compileTemplate(
                `<template>
                    <div>{validity}</div>
                </template>`
            );
            class MyComponent extends LightningElement {
                state = { value: 0 };

                getTextContent() {
                    return this.template.querySelector('div').textContent;
                }

                get validity() {
                    return this.state.value > 5;
                }

                updateTrackedValue(value: number) {
                    this.state.value = value;
                }

                render() {
                    return html;
                }
            }

            MyComponent.track = { state: 1 };
            MyComponent.publicProps = {
                validity: {},
            };
            MyComponent.publicMethods = ['updateTrackedValue', 'getTextContent'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.updateTrackedValue(10);
            return Promise.resolve().then(() => {
                expect(elm.getTextContent()).toBe('true');
            });
        });

        it('should call public getter with correct context', function() {
            let component;
            let context;

            class MyComponent extends LightningElement {
                constructor() {
                    super();
                    component = this;
                }

                get breakfast() {
                    context = this;
                    return 'breakfast';
                }
            }

            MyComponent.publicProps = {
                breakfast: {},
            };

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.breakfast;

            expect(context).toBe(component);
        });

        it('should call setter function when used directly from DOM', function() {
            class MyChild extends LightningElement {
                value = 'pancakes';
                get breakfast() {
                    return this.value;
                }

                set breakfast(value) {
                    this.value = value;
                }
            }
            MyChild.publicProps = {
                breakfast: {},
            };

            const html = compileTemplate(
                `<template>
                    <x-child></x-child>
                </template>`,
                {
                    modules: { 'x-child': MyChild },
                }
            );
            class MyComponent extends LightningElement {
                render() {
                    return html;
                }
                run() {
                    this.template.querySelector('x-child').breakfast = 'eggs';
                    return this.template.querySelector('x-child').breakfast;
                }
            }
            MyComponent.publicMethods = ['run'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(elm.run()).toBe('eggs');
        });

        it('should execute setter function with correct context when component is root', function() {
            let callCount = 0;
            let context;
            let component;

            class MyComponent extends LightningElement {
                constructor() {
                    super();
                    component = this;
                }

                value = 'pancakes';
                get breakfast() {
                    return this.value;
                }

                set breakfast(value) {
                    context = this;
                    callCount += 1;
                    this.value = value;
                }
            }

            MyComponent.publicProps = {
                breakfast: {},
            };

            const elm = createElement('x-foo', { is: MyComponent });

            elm.breakfast = 'eggs';
            expect(callCount).toBe(1);
            expect(component).toBe(context);
        });

        it('should call setter with correct context when template value is updated', function() {
            let callCount = 0;
            let component;
            let context;

            class MyComponent extends LightningElement {
                value = 'pancakes';

                constructor() {
                    super();
                    component = this;
                }

                get breakfast() {
                    return this.value;
                }

                set breakfast(value) {
                    callCount += 1;
                    context = this;
                    this.value = value;
                }
            }

            MyComponent.publicProps = {
                breakfast: {},
            };

            const elm = createElement('x-foo', { is: MyComponent });
            elm.breakfast = 'eggs';

            expect(callCount).toBe(1);
            expect(context).toBe(component);
        });

        it('should call setter when default value is provided', function() {
            let callCount = 0;
            let component;
            let context;

            class MyComponent extends LightningElement {
                value;
                breakfast = 'pancakes';

                constructor() {
                    super();
                    component = this;
                }

                get breakfast() {
                    return this.value;
                }

                set breakfast(value) {
                    callCount += 1;
                    context = this;
                    this.value = value;
                }
            }

            MyComponent.publicProps = {
                breakfast: {},
            };

            createElement('x-foo', { is: MyComponent });

            expect(callCount).toBe(1);
            expect(context).toBe(component);
        });

        it('should throw when configured prop is missing getter', function() {
            class MyComponent extends LightningElement {
                set breakfast(value) {}
            }

            MyComponent.publicProps = {
                breakfast: {},
            };

            expect(() => {
                createElement('x-foo', { is: MyComponent });
            }).toThrow();
        });
    });

    describe('styles', function() {
        it('should handle string styles', function() {
            let calledCSSText = false;

            const html = compileTemplate(
                `<template>
                    <section style={state.customStyle}></section>
                </template>`
            );
            class MyComponent extends LightningElement {
                state = {
                    customStyle: 'color: red',
                };

                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            const cssTextPropDef = Object.getOwnPropertyDescriptor(
                CSSStyleDeclaration.prototype,
                'cssText'
            );
            Object.defineProperty(CSSStyleDeclaration.prototype, 'cssText', {
                get() {
                    return cssTextPropDef.get.call(this);
                },
                set(value) {
                    calledCSSText = true;
                    return cssTextPropDef.set.call(this, value);
                },
            });
            document.body.appendChild(elm);
            expect(elm.shadowRoot.querySelector('section').style.cssText).toBe('color: red;');
            expect(calledCSSText).toBe(true);
        });

        it('should handle undefined properly', function() {
            let calledCSSTextWithUndefined = false;

            const html = compileTemplate(
                `<template>
                    <section style={state.customStyle}></section>
                </template>`
            );
            class MyComponent extends LightningElement {
                state = {
                    customStyle: undefined,
                };

                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            const cssTextPropDef = Object.getOwnPropertyDescriptor(
                CSSStyleDeclaration.prototype,
                'cssText'
            );
            Object.defineProperty(CSSStyleDeclaration.prototype, 'cssText', {
                get() {
                    return cssTextPropDef.get.call(this);
                },
                set(value) {
                    if (value === 'undefined') {
                        calledCSSTextWithUndefined = true;
                    }
                    return cssTextPropDef.set.call(this, value);
                },
            });
            document.body.appendChild(elm);
            expect(elm.style.cssText).toBe('');
            expect(calledCSSTextWithUndefined).toBe(false);
        });

        it('should handle null properly', function() {
            const html = compileTemplate(
                `<template>
                    <section style={state.customStyle}></section>
                </template>`
            );
            class MyComponent extends LightningElement {
                state = {
                    customStyle: null,
                };

                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(elm.style.cssText).toBe('');
        });

        it('should diff between style objects and strings correctly', function() {
            const html = compileTemplate(
                `<template>
                    <section style={customStyle}></section>
                </template>`
            );
            class MyComponent extends LightningElement {
                customStyle: {
                    color: 'red';
                };

                updateStyle() {
                    this.customStyle = 'color:green;';
                }

                render() {
                    return html;
                }
            }

            MyComponent.track = { customStyle: 1 };
            MyComponent.publicMethods = ['updateStyle'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);

            const section = elm.shadowRoot.querySelector('section');

            const removePropertyMock = jest.fn();
            section.style.removeProperty = removePropertyMock;
            const setPropertyMock = jest.fn();
            section.style.setProperty = setPropertyMock;

            elm.updateStyle();
            return Promise.resolve().then(() => {
                expect(removePropertyMock).not.toBeCalled();
                expect(setPropertyMock).toBeCalledWith('color', 'green', '');
            });
        });
    });

    describe('public methods', () => {
        it('should not invoke function when accessing public method', function() {
            let callCount = 0;

            class MyComponent extends LightningElement {
                m() {
                    callCount += 1;
                }
            }
            MyComponent.publicMethods = ['m'];

            const elm = createElement('x-foo', { is: MyComponent });
            elm.m;
            expect(callCount).toBe(0);
        });

        it('should invoke function only once', function() {
            let callCount = 0;

            class MyComponent extends LightningElement {
                m() {
                    callCount += 1;
                }
            }
            MyComponent.publicMethods = ['m'];

            const elm = createElement('x-foo', { is: MyComponent });
            elm.m();
            expect(callCount).toBe(1);
        });

        it('should call function with correct context and arguments', function() {
            let component;
            let context;
            let args;

            class MyComponent extends LightningElement {
                constructor() {
                    super();
                    component = this;
                }

                m() {
                    context = this;
                    args = Array.prototype.slice.call(arguments);
                }
            }
            MyComponent.publicMethods = ['m'];

            const elm = createElement('x-foo', { is: MyComponent });
            elm.m(1, 2);

            expect(context).toBe(component);
            expect(args).toEqual([1, 2]);
        });

        it('should express function identity with strict equality', function() {
            class MyComponent extends LightningElement {
                m() {}
            }
            MyComponent.publicMethods = ['m'];

            const elm = createElement('x-foo', { is: MyComponent });
            expect(elm.m).toBe(elm.m);
        });

        it('should allow calling methods when element is referenced with querySelector', function() {
            let count = 0;
            class MyChild extends LightningElement {
                m() {
                    count += 1;
                }
            }
            MyChild.publicMethods = ['m'];

            const html = compileTemplate(
                `<template>
                    <x-child></x-child>
                </template>`,
                {
                    modules: { 'x-child': MyChild },
                }
            );
            class MyComponent extends LightningElement {
                callChildM() {
                    this.template.querySelector('x-child').m();
                }
                render() {
                    return html;
                }
            }
            MyComponent.publicMethods = ['callChildM'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(() => {
                elm.callChildM();
            }).not.toThrow();
            expect(count).toBe(1);
        });

        it('should allow calling getAttribute on child when referenced with querySelector', function() {
            class MyChild extends LightningElement {}

            const html = compileTemplate(
                `<template>
                    <x-child></x-child>
                </template>`,
                {
                    modules: { 'x-child': MyChild },
                }
            );
            class MyComponent extends LightningElement {
                getChildAttribute() {
                    this.template.querySelector('x-child').getAttribute('title');
                }
                render() {
                    return html;
                }
            }
            MyComponent.publicMethods = ['getChildAttribute'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(() => {
                elm.getChildAttribute();
            }).not.toThrow();
        });

        it('should allow calling setAttribute on child when referenced with querySelector', function() {
            class MyChild extends LightningElement {}

            const html = compileTemplate(
                `<template>
                    <x-child></x-child>
                </template>`,
                {
                    modules: { 'x-child': MyChild },
                }
            );
            class MyComponent extends LightningElement {
                setChildAttribute() {
                    this.template.querySelector('x-child').setAttribute('title', 'foo');
                }
                render() {
                    return html;
                }
            }
            MyComponent.publicMethods = ['setChildAttribute'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(() => {
                elm.setChildAttribute();
            }).not.toThrow();
        });

        it('should allow calling removeAttribute on child when referenced with querySelector', function() {
            class MyChild extends LightningElement {}

            const html = compileTemplate(
                `<template>
                    <x-child></x-child>
                </template>`,
                {
                    modules: { 'x-child': MyChild },
                }
            );
            class MyComponent extends LightningElement {
                removeChildAttribute() {
                    this.template.querySelector('x-child').removeAttribute('title');
                }
                render() {
                    return html;
                }
            }
            MyComponent.publicMethods = ['removeChildAttribute'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(() => {
                elm.removeChildAttribute();
            }).not.toThrow();
        });
    });
    describe('Access to vm', () => {
        it('Cannot access vm using component', () => {
            let instance;
            class MyComponent extends LightningElement {
                constructor() {
                    super();
                    instance = this;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const vm = getComponentVM(instance);
            const fields = getOwnPropertySymbols(instance);

            // none of the symbols on instance should give access to vm
            expect(fields.filter(field => instance[field] === vm)).toEqual([]);
        });
    });
});
