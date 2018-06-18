import { createElement, Element } from '../main';
import { ViewModelReflection } from "../utils";

describe('vm', () => {
    describe('insertion index', () => {
        it('should assign idx=0 (insertion index) during construction', () => {
            class MyComponent1 extends Element {}
            const elm = createElement('x-foo', { is: MyComponent1 });
            expect(elm[ViewModelReflection].idx).toBe(0);
        });

        it('should assign idx>0 after insertion', () => {
            class MyComponent2 extends Element {}
            const elm = createElement('x-foo', { is: MyComponent2 });
            document.body.appendChild(elm);
            expect(elm[ViewModelReflection].idx).toBeGreaterThan(0);
        });

        it('should assign idx=0 after removal', () => {
            class MyComponent3 extends Element {}
            const elm = createElement('x-foo', { is: MyComponent3 });
            document.body.appendChild(elm);
            document.body.removeChild(elm);
            expect(elm[ViewModelReflection].idx).toBe(0);
        });

        it('should assign bigger idx to children', () => {
            let vm1: VM, vm2: VM;
            class ChildComponent4 extends Element {
                constructor() {
                    super();
                    vm2 = this[ViewModelReflection];
                }
            }
            function html($api) {
                return [$api.c('x-bar', ChildComponent4, {})];
            }
            class MyComponent4 extends Element {
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
            class ChildComponent5 extends Element {
                constructor() {
                    super();
                    vm2 = this[ViewModelReflection];
                }
                render() {
                    counter++;
                }
            }
            function html($api) {
                return [$api.c('x-bar', ChildComponent5, {})];
            }
            class MyComponent5 extends Element {
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

});
