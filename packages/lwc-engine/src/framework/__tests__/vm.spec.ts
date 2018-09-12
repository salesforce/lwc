import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../main';
import { ViewModelReflection } from "../utils";
import { getErrorComponentStack } from "../vm";

describe('vm', () => {
    describe('insertion index', () => {
        it('should assign idx=0 (insertion index) during construction', () => {
            class MyComponent1 extends LightningElement {}
            const elm = createElement('x-foo', { is: MyComponent1 });
            expect(elm[ViewModelReflection].idx).toBe(0);
        });

        it('should assign idx>0 after insertion', () => {
            class MyComponent2 extends LightningElement {}
            const elm = createElement('x-foo', { is: MyComponent2 });
            document.body.appendChild(elm);
            expect(elm[ViewModelReflection].idx).toBeGreaterThan(0);
        });

        it('should assign idx=0 after removal', () => {
            class MyComponent3 extends LightningElement {}
            const elm = createElement('x-foo', { is: MyComponent3 });
            document.body.appendChild(elm);
            document.body.removeChild(elm);
            expect(elm[ViewModelReflection].idx).toBe(0);
        });

        it('should assign bigger idx to children', () => {
            let vm1: VM, vm2: VM;

            class ChildComponent4 extends LightningElement {
                constructor() {
                    super();
                    vm2 = this[ViewModelReflection];
                }
            }

            const html  = compileTemplate(`
                <template>
                    <x-bar></x-bar>
                </template>
            `, {
                modules: { 'x-bar': ChildComponent4 }
            });
            class MyComponent4 extends LightningElement {
                constructor() {
                    super();
                    vm1 = this[ViewModelReflection];
                }
                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent4 });
            document.body.appendChild(elm);
            expect(vm1.idx).toBeGreaterThan(0);
            expect(vm2.idx).toBeGreaterThan(0);
            expect(vm2.idx).toBeGreaterThan(vm1.idx);
        });

        it('should assign bigger idx on reinsertion, including children idx', () => {
            let vm1: VM, vm2: VM;
            let counter = 0;
            class ChildComponent5 extends LightningElement {
                constructor() {
                    super();
                    vm2 = this[ViewModelReflection];
                }
                render() {
                    counter++;
                }
            }

            const html  = compileTemplate(`
                <template>
                    <x-bar></x-bar>
                </template>
            `, {
                modules: { 'x-bar': ChildComponent5 }
            });
            class MyComponent5 extends LightningElement {
                constructor() {
                    super();
                    vm1 = this[ViewModelReflection];
                }
                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent5 });
            document.body.appendChild(elm);
            expect(vm1.idx).toBeGreaterThan(0);
            expect(vm2.idx).toBeGreaterThan(0);
            const firstIdx = vm1.idx;
            document.body.removeChild(elm);
            expect(vm1.idx).toBe(0);
            expect(vm2.idx).toBe(0);
            // reinsertion
            document.body.appendChild(elm);
            expect(vm1.idx).toBeGreaterThan(firstIdx);
            expect(vm2.idx).toBeGreaterThan(vm1.idx);
            expect(counter).toBe(2);
        });

    });

    describe('getComponentStack', () => {
        it('should return stack with hierarchy bottom up.', () => {
            let vm: VM;
            class ChildComponentCs extends LightningElement {
                constructor() {
                    super();
                    vm = this[ViewModelReflection];
                }
            }
            const html  = compileTemplate(`
                <template>
                    <x-child></x-child>
                </template>
            `, {
                modules: { 'x-child': ChildComponentCs }
            });
            class ParentComponentCs extends LightningElement {
                constructor() {
                    super();
                }
                render() {
                    return html;
                }
            }

            const elm = createElement('x-parent', { is: ParentComponentCs });
            document.body.appendChild(elm);

            expect(getErrorComponentStack(vm.elm)).toBe('<x-parent>\n\t<x-child>');
        });
    });

});
