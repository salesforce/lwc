import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../main';
import { ViewModelReflection } from "../utils";
import { getErrorComponentStack, getNodeOwner } from "../vm";

describe('vm', () => {
    describe('getNodeOwner', () => {
        afterEach(() => {
            while (document.body.childNodes.length > 0) {
                document.body.removeChild(document.body.childNodes[0]);
            }
        });
        const childHtml = compileTemplate(`<template><span id="child-cmp-span">txt</span></template>`);

        class ChildComponent extends LightningElement {
            render() {
                return childHtml;
            }
        }

        const containerHtml  = compileTemplate(`
            <template>
            hello world
                <div id="container">
                    <div id="child-div">some text node</div>
                    <x-child></x-child>
                </div>
            </template>
        `, {
            modules: { 'x-child': ChildComponent }
        });

        it('should return null when node is the root custom element', () => {
            class ContainerComponent extends LightningElement {
                render() {
                    return containerHtml;
                }
            }
            const elm = createElement('x-container', { is: ContainerComponent });
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                const owner = getNodeOwner(elm);
                expect(owner).toBeNull();
            });
        });

        it('should return host element when node is the shadow', () => {
            let cmpShadow;
            class ContainerComponent extends LightningElement {
                constructor() {
                    super();
                    cmpShadow = this.template;
                }
                render() {
                    return containerHtml;
                }
            }
            const elm = createElement('x-container', { is: ContainerComponent });
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                const owner = getNodeOwner(cmpShadow);
                expect(owner).toBe(elm);
            });
        });

        it('should return host element when has to traverse multiple elements', () => {
            class ContainerComponent extends LightningElement {
                render() {
                    return containerHtml;
                }
            }
            const elm = createElement('x-container', { is: ContainerComponent });
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                const owner = getNodeOwner(document.getElementById('child-div')!);
                expect(owner).toBe(elm);
            });
        });

        it('should return host element when node is a component custom element', () => {
            class ContainerComponent extends LightningElement {
                render() {
                    return containerHtml;
                }
            }
            const elm = createElement('x-container', { is: ContainerComponent });
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                const owner = getNodeOwner(document.getElementsByTagName('x-child')[0]);
                expect(owner).toBe(elm);
            });
        });

        it('should return first host element found in the hierarchy', () => {
            class ContainerComponent extends LightningElement {
                render() {
                    return containerHtml;
                }
            }
            const elm = createElement('x-container', { is: ContainerComponent });
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                const owner = getNodeOwner(document.getElementById('child-cmp-span')!);
                expect(owner).toBe(document.getElementsByTagName('x-child')[0]);
            });
        });

        it('should return null when node is not contained in lwc component', () => {
            const div = document.createElement("div");
            div.innerHTML = 'some text';
            document.body.appendChild(div);
            const owner = getNodeOwner(div.childNodes[0]);
            expect(owner).toBeNull();
        });
    });

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
    describe('slotting for slowpath', () => {
        it('should re-keyed slotted content to avoid reusing elements from default content', () => {
            const childHTML = compileTemplate(`<template>
                <slot>
                    <h1>default slot default content</h1>
                </slot>
                <slot name="foo">
                    <h2>foo slot default content</h2>
                </slot>
            </template>`);
            class ChildComponent extends LightningElement {
                render() {
                    return childHTML;
                }
                renderedCallback() {
                    const h1 = this.template.querySelector('h1');
                    const h2 = this.template.querySelector('h2');
                    if (h1) {
                        h1.setAttribute('def-1', 'internal');
                    }
                    if (h2) {
                        h2.setAttribute('def-2', 'internal');
                    }
                }
            }
            const parentHTML = compileTemplate(`<template>
                <c-child>
                    <template if:true={h1}>
                        <h1 slot="">slotted</h1>
                    </template>
                    <template if:true={h2}>
                        <h2 slot="foo"></h2>
                    </template>
                </c-child>
            </template>`, {
                modules: {
                    'c-child': ChildComponent
                }
            });
            let parentTemplate;
            class Parent extends LightningElement {
                constructor() {
                    super();
                    this.h1 = false;
                    this.h2 = false;
                    parentTemplate = this.template;
                }
                render() {
                    return parentHTML;
                }
                enable() {
                    this.h1 = this.h2 = true;
                }
                disable() {
                    this.h1 = this.h2 = true;
                }
            }
            Parent.track = { h1: 1, h2: 1 };
            Parent.publicMethods = ['enable', 'disable'];

            const elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);
            elm.enable();
            return Promise.resolve().then(() => {
                // at this point, if we are reusing the h1 and h2 from the default content
                // of the slots in c-child, they will have an extraneous attribute on them,
                // which will be a problem.
                expect(parentTemplate.querySelector('c-child').outerHTML).toBe(`<c-child><h1 slot="">slotted</h1><h2 slot="foo"></h2></c-child>`);
            });
        });
    });
});
