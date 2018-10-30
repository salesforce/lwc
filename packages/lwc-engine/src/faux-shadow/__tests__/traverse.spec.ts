import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../../framework/main';
import { getShadowRoot } from "../../faux-shadow/shadow-root";

describe('#LightDom querySelectorAll()', () => {
    describe('Invoked from within component', () => {
        it('should allow searching for passed elements', () => {
            const parentTmpl = compileTemplate(`
                <template>
                    <slot></slot>
                </template>
            `);

            class Parent extends LightningElement {
                render() {
                    return parentTmpl;
                }
            }

            const containerTmpl = compileTemplate(`
                <template>
                    <x-parent>
                        <div class="first">First</div>
                        <div class="second">Second</div>
                    </x-parent>
                </template>
            `, {
                modules: { 'x-parent': Parent },
            });

            class Container extends LightningElement {
                render() {
                    return containerTmpl;
                }
            }

            const element = createElement('lightdom-queryselector', { is: Container });
            document.body.appendChild(element);
            const nested = element.shadowRoot.querySelector('x-parent').querySelectorAll('div');
            expect(nested).toHaveLength(2);
            expect(nested[0]).toBe(element.shadowRoot.querySelector('.first'));
            expect(nested[1]).toBe(element.shadowRoot.querySelector('.second'));
        });

        it('should ignore elements from template', () => {
            const childTmpl = compileTemplate(`<template><p></p></template>`);
            class Child extends LightningElement {
                render() {
                    return childTmpl;
                }
            }

            const parentTmpl = compileTemplate(
                `<template><x-child></x-child></template>`,
                { modules: { 'x-child': Child } }
            );
            class Parent extends LightningElement {
                render() {
                    return parentTmpl;
                }
            }

            const elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);
            expect(elm.shadowRoot.querySelector('x-child').querySelectorAll('p')).toHaveLength(0);
        });

        it('should return an empty array if no elements match', () => {
            const testTmpl = compileTemplate(`<template><p></p></template>`);
            class Test extends LightningElement {
                render() {
                    return testTmpl;
                }
            }

            const elm = createElement('x-test', { is: Test });
            document.body.appendChild(elm);
            expect(elm.shadowRoot.querySelectorAll('div').length).toEqual(0);
        });
    });

    describe('Invoked from element instance', () => {
        it('should allow searching for passed elements', () => {
            const parentTmpl = compileTemplate(`
                <template>
                    <slot></slot>
                </template>
            `);

            class Parent extends LightningElement {
                render() {
                    return parentTmpl;
                }
            }

            const containerTmpl = compileTemplate(`
                <template>
                    <x-parent>
                        <div class="first">First</div>
                        <div class="second">Second</div>
                    </x-parent>
                </template>
            `, {
                modules: { 'x-parent': Parent },
            });

            class Container extends LightningElement {
                render() {
                    return containerTmpl;
                }
            }

            const element = createElement('lightdom-queryselector', { is: Container });
            document.body.appendChild(element);

            const nested = element.shadowRoot.querySelector('x-parent').querySelectorAll('div');
            expect(nested).toHaveLength(2);
            expect(nested[0]).toBe(element.shadowRoot.querySelector('.first'));
            expect(nested[1]).toBe(element.shadowRoot.querySelector('.second'));
        });
    });
});

describe('#LightDom querySelector()', () => {
    it('should allow searching for the passed element multiple levels up', () => {
        class Root extends LightningElement {
            render() {
                return rootHTML;
            }
        }
        class Parent extends LightningElement {
            render() {
                return parentHTML;
            }
        }
        let target;
        class Child extends LightningElement {
            renderedCallback() {
                target = this.querySelector('div');
            }
             render() {
                return childHTML;
            }
        }
        const parentHTML = compileTemplate(`
            <template>
                <x-child>
                    <slot></slot>
                </x-child>
            </template>
        `, {
            modules: { 'x-child': Child },
        });
        const rootHTML = compileTemplate(`
            <template>
                <x-parent>
                    <div></div>
                </x-parent>
            </template>
        `, {
            modules: { 'x-parent': Parent },
        });
        const childHTML = compileTemplate(`
            <template>
                <div onclick={handleClick}>
                    <slot></slot>
                </div>
            </template>
        `, {
            modules: {},
        });
        const elm = createElement('x-root', { is: Root });
        document.body.appendChild(elm);
        const div = getShadowRoot(elm).querySelector('div');
        expect(div).toBe(target);
    });
    it('should allow searching for the passed element', () => {
        const parentTmpl = compileTemplate(`
            <template>
                <slot></slot>
            </template>
        `);

        class Parent extends LightningElement {
            render() {
                return parentTmpl;
            }
        }

        const containerTmpl = compileTemplate(`
            <template>
                <x-parent>
                    <div class="first">First</div>
                    <div class="second">Second</div>
                </x-parent>
            </template>
        `, {
            modules: { 'x-parent': Parent },
        });

        class Container extends LightningElement {
            render() {
                return containerTmpl;
            }
        }

        const element = createElement('lightdom-queryselector', { is: Container });
        document.body.appendChild(element);

        const div = element.shadowRoot.querySelector('x-parent').querySelector('div');
        expect(div).toBe(element.shadowRoot.querySelector('.first'));
    });

    it('should ignore element from template', () => {
        const childTmpl = compileTemplate(`<template><p></p></template>`);
        class Child extends LightningElement {
            render() {
                return childTmpl;
            }
        }

        const parentTmpl = compileTemplate(
            `<template><x-child></x-child></template>`,
            { modules: { 'x-child': Child } }
        );
        class Parent extends LightningElement {
            render() {
                return parentTmpl;
            }
        }

        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.querySelector('x-child').querySelector('p')).toBeNull();
    });

    it('should return null if element does not exist', () => {
        const testTmpl = compileTemplate(`<template><p></p></template>`);
        class Test extends LightningElement {
            render() {
                return testTmpl;
            }
        }

        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.querySelector('div')).toBeNull();
    });
});

describe('#shadowRoot querySelector', () => {
    it('should querySelector on element from template', () => {
        const testTmpl = compileTemplate(`
            <template>
                <ul>
                    <li></li>
                </ul>
            </template>
        `);
        class Test extends LightningElement {
            render() {
                return testTmpl;
            }
        }

        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        const ul = elm.shadowRoot.querySelector('ul');
        expect(ul).toBeDefined();
        const li = ul.querySelector('li');
        expect(li).toBeDefined();
    });

    it('should not reach into child components template when querySelector invoked on child custom element', () => {
        const myChildTmpl = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyChild extends LightningElement {
            render() {
                return myChildTmpl;
            }
        }

        const myComponentTmpl = compileTemplate(`
            <template>
                <membrane-parent-query-selector-child-custom-element-child></membrane-parent-query-selector-child-custom-element-child>
            </template>
        `, {
            modules: {
                'membrane-parent-query-selector-child-custom-element-child': MyChild,
            }
        });
        class MyComponent extends LightningElement {
            render() {
                return myComponentTmpl;
            }
        }

        const elm = createElement('membrane-parent-query-selector-child-custom-element', { is: MyComponent });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.querySelector('membrane-parent-query-selector-child-custom-element-child').querySelector('div')).toBe(null);
    });

    it('should querySelectorAll on element from template', () => {
        const myComponentTmpl = compileTemplate(`
            <template>
                <ul>
                    <li></li>
                </ul>
            </template>
        `);
        class MyComponent extends LightningElement {
            render() {
                return myComponentTmpl;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const ul = elm.shadowRoot.querySelectorAll('ul')[0];
        expect(ul);
        const li = ul.querySelectorAll('li')[0];
        expect(li);
    });

    it('should adopt elements not defined in template as part of the shadow', () => {
        const myComponentTmpl = compileTemplate(`
            <template>
                <ul></ul>
            </template>
        `);
        class MyComponent extends LightningElement {
            render() {
                return myComponentTmpl;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const ul = elm.shadowRoot.querySelector('ul');
        expect(ul);
        ul.appendChild(document.createElement('li'));
        const li1 = ul.querySelectorAll('li')[0];
        expect(li1).toBeDefined();
        const li2 = ul.querySelector('li');
        expect(li2).toBe(li1);
        const li3 = ul.childNodes[0];
        expect(li3).toBe(li1);
    });

    it('should not throw error if querySelector does not match any elements', () => {
        const myComponentTmpl = compileTemplate(`
            <template>
                <ul></ul>
            </template>
        `);
        class MyComponent extends LightningElement {
            render() {
                return myComponentTmpl;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        expect(() => {
            elm.shadowRoot.querySelector('doesnotexist');
        }).not.toThrow();
    });

    it('should return null if querySelector does not match any elements', () => {
        const myComponentTmpl = compileTemplate(`
            <template>
                <ul></ul>
            </template>
        `);
        class MyComponent extends LightningElement {
            render() {
                return myComponentTmpl;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.querySelector('doesnotexist')).toBeNull();
    });

    it('should not throw error if querySelectorAll does not match any elements', () => {
        const myComponentTmpl = compileTemplate(`
            <template>
                <ul></ul>
            </template>
        `);
        class MyComponent extends LightningElement {
            render() {
                return myComponentTmpl;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        expect(() => {
            elm.shadowRoot.querySelectorAll('doesnotexist');
        }).not.toThrow();
    });

    it('should not expose shadow root on child custom element', () => {
        expect.assertions(1);
        let childTemplate;

        const myChildTmpl = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyChild extends LightningElement {
            constructor() {
                super();
                childTemplate = this.template;
            }

            render() {
                return myChildTmpl;
            }
        }

        const myComponentTemplate = compileTemplate(`
            <template>
                <x-child-parent-shadow-root onclick={handleClick}></x-child-parent-shadow-root>
            </template>
        `, {
            modules: {
                'x-child-parent-shadow-root': MyChild,
            }
        });
        class MyComponent extends LightningElement {
            handleClick(evt) {
                expect(evt.target.parentNode).not.toBe(childTemplate);
            }

            render() {
                return myComponentTemplate;
            }
        }

        const elm = createElement('membrane-child-parent-shadow-root-parent', { is: MyComponent });
        document.body.appendChild(elm);
        elm.shadowRoot.querySelector('x-child-parent-shadow-root').shadowRoot.querySelector('div').click();
    });
});

describe('#parentNode and #parentElement', () => {
    it('should allow walking back to the shadow root', () => {
        const myComponentTmpl = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            render() {
                return myComponentTmpl;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const root = elm.shadowRoot;
        expect(root.querySelector('div').parentNode).toBe(root);
    });

    it('should not allow walking back to the shadow root via parentElement', () => {
        const myComponentTmpl = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            render() {
                return myComponentTmpl;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const root = elm.shadowRoot;
        expect(root.querySelector('div').parentElement).toBe(null);
    });
});

describe('proxy', () => {
    it('should allow setting properties manually', () => {
        const myComponentTmpl = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            render() {
                return myComponentTmpl;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const root = elm.shadowRoot;
        root.querySelector('div').id = 'something';
        expect(root.querySelector('div').getAttribute('id')).toBe('something');
    });
    it('should allow setting innerHTML manually', () => {
        const myComponentTmpl = compileTemplate(`
            <template>
                <span></span>
            </template>
        `);
        class MyComponent extends LightningElement {
            render() {
                return myComponentTmpl;
            }
            renderedCallback() {
                this.template.querySelector('span').innerHTML = '<i>something</i>';
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const root = elm.shadowRoot;
        expect(root.querySelector('span').textContent).toBe('something');
    });
    it('should unwrap arguments when invoking a method on a proxy', () => {
        const myComponentTmpl = compileTemplate(`
            <template>
                <div>
                    <p></p>
                </div>
            </template>
        `);
        class MyComponent extends LightningElement {
            render() {
                return myComponentTmpl;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const root = elm.shadowRoot;
        const div = root.querySelector('div');
        const p = root.querySelector('p');
        expect(div.contains(p)).toBe(true);
    });
    it('should allow setting attributes manually', () => {
        const myComponentTmpl = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            render() {
                return myComponentTmpl;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const root = elm.shadowRoot;
        root.querySelector('div').setAttribute('id', 'something');
        expect(root.querySelector('div').id).toBe('something');
    });
});

describe('#childNodes', () => {
    it('should always return an empty array for slots not rendering default content', () => {
        const hasSlotTmpl = compileTemplate(`
            <template>
                <slot>
                    <div></div>
                </slot>
            </template>
        `);
        class HasSlot extends LightningElement {
            render() {
                return hasSlotTmpl;
            }
        }

        const parentTmpl = compileTemplate(`
            <template>
                <div>
                    <x-child-node-with-slot>
                        <p></p>
                    </x-child-node-with-slot>
                </div>
            </template>
        `, {
            modules: {
                'x-child-node-with-slot': HasSlot
            }
        });
        class Parent extends LightningElement {
            render() {
                return parentTmpl;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot.querySelector('x-child-node-with-slot').shadowRoot.querySelector('slot');
        expect(slot.childNodes).toHaveLength(0);
    });

    it('should return correct elements for slots rendering default content', () => {
        const hasSlotTmpl = compileTemplate(`
            <template>
                <slot>
                    <div></div>
                </slot>
            </template>
        `);
        class HasSlot extends LightningElement {
            render() {
                return hasSlotTmpl;
            }
        }

        const parentTmpl = compileTemplate(`
            <template>
                <div>
                    <x-child-node-with-slot></x-child-node-with-slot>
                </div>
            </template>
        `, {
            modules: {
                'x-child-node-with-slot': HasSlot
            }
        });
        class Parent extends LightningElement {
            render() {
                return parentTmpl;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot.querySelector('x-child-node-with-slot').shadowRoot.querySelector('slot');
        expect(slot.childNodes).toHaveLength(1);
    });

    it('should return correct elements for non-slot elements', () => {
        const html = compileTemplate(`
            <template>
                <div>
                    <p></p>
                </div>
            </template>
        `);
        class Parent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('div');
        const childNodes = child.childNodes;
        expect(childNodes).toHaveLength(1);
        expect(childNodes[0]).toBe(elm.shadowRoot.querySelector('p'));
    });

    it('should log a warning when accessing childNodes property', () => {
        const html = compileTemplate(`
            <template>
                <div>
                    <p></p>
                </div>
            </template>
        `);
        class Parent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);

        expect(() => {
            const childNodes = elm.shadowRoot.childNodes;
        }).toLogWarning(`Discouraged access to property 'childNodes' on 'Node': It returns a live NodeList and should not be relied upon. Instead, use 'querySelectorAll' which returns a static NodeList.`);

        expect(() => {
            const child = elm.shadowRoot.querySelector('div');
            const childNodes = child.childNodes;
        }).toLogWarning(`Discouraged access to property 'childNodes' on 'Node': It returns a live NodeList and should not be relied upon. Instead, use 'querySelectorAll' which returns a static NodeList.`);
    });

    it('should return correct elements for custom elements when no children present', () => {
        const childTmpl = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class Child extends LightningElement {
            render() {
                return childTmpl;
            }
        }

        const parentTmpl = compileTemplate(`
            <template>
                <div>
                    <x-child></x-child>
                </div>
            </template>
        `, {
            modules: {
                'x-child': Child
            }
        });
        class Parent extends LightningElement {
            render() {
                return parentTmpl;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-child');
        const childNodes = child.childNodes;
        expect(childNodes).toHaveLength(0);
    });

    it('should return correct elements for custom elements when children present', () => {
        const childTmpl = compileTemplate(`
            <template>
                <slot></slot>
            </template>
        `);
        class Child extends LightningElement {
            render() {
                return childTmpl;
            }
        }

        const parentTmpl = compileTemplate(`
            <template>
                <div>
                    <x-child>
                        <p></p>
                    </x-child>
                </div>
            </template>
        `, {
            modules: {
                'x-child': Child
            }
        });
        class Parent extends LightningElement {
            render() {
                return parentTmpl;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-child');
        const childNodes = child.childNodes;
        expect(childNodes).toHaveLength(1);
    });

    it('should return child text content passed via slot', () => {
        const childTmpl = compileTemplate(`
            <template>
                <slot></slot>
            </template>
        `);
        class Child extends LightningElement {
            render() {
                return childTmpl;
            }
        }

        const parentTmpl = compileTemplate(`
            <template>
                <div>
                    <x-child>
                        text
                    </x-child>
                </div>
            </template>
        `, {
            modules: {
                'x-child': Child
            }
        });
        class Parent extends LightningElement {
            render() {
                return parentTmpl;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-child');
        const childNodes = child.childNodes;
        expect(childNodes).toHaveLength(1);
        expect(childNodes[0].nodeType).toBe(3);
        expect(childNodes[0].textContent).toBe('text');
    });

    it('should not return child text from within template', () => {
        const childTmpl = compileTemplate(`
            <template>
                text
            </template>
        `);
        class Child extends LightningElement {
            render() {
                return childTmpl;
            }
        }

        const parentTmpl = compileTemplate(`
            <template>
                <div>
                    <x-child></x-child>
                </div>
            </template>
        `, {
            modules: {
                'x-child': Child
            },
        });
        class Parent extends LightningElement {
            render() {
                return parentTmpl;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-child');
        const childNodes = child.childNodes;
        expect(childNodes).toHaveLength(0);
    });

    it('should not return dynamic child text from within template', () => {
        const childTmpl = compileTemplate(`
            <template>
                {dynamicText}
            </template>
        `);
        class Child extends LightningElement {
            get dynamicText() {
                return 'text';
            }
            render() {
                return childTmpl;
            }
        }

        const parentTmpl = compileTemplate(`
            <template>
                <x-child></x-child>
            </template>
        `, {
            modules: {
                'x-child': Child
            },
        });
        class Parent extends LightningElement {
            render() {
                return parentTmpl;
            }
        }

        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        const childNodes = elm.shadowRoot.querySelector('x-child').childNodes;
        expect(childNodes).toHaveLength(0);
    });

    it('should return correct childNodes from shadowRoot', () => {
        const html = compileTemplate(`
            <template>
                <div></div>
                text
            </template>
        `);
        class Parent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const childNodes = elm.shadowRoot.childNodes;
        expect(childNodes).toHaveLength(2);
        expect(childNodes[0]).toBe(elm.shadowRoot.querySelector('div'));
        expect(childNodes[1].nodeType).toBe(3);
        expect(childNodes[1].textContent).toBe('text');
    });
});


describe('assignedSlot', () => {
    it('should return null when custom element is not in slot', () => {
        class NoSlot extends LightningElement {}

        const html = compileTemplate(`
            <template>
                <x-assigned-slot-child></x-assigned-slot-child>
            </template>
        `, {
            modules: {
                'x-assigned-slot-child': NoSlot,
            }
        });
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-assigned-slot', { is: MyComponent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-assigned-slot-child');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return null when native element is not in slot', () => {
        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-assigned-slot', { is: MyComponent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('div');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return correct slot when native element is slotted', () => {
        const slottedHtml = compileTemplate(`
            <template>
                <slot></slot>
            </template>
        `);
        class WithSlot extends LightningElement {
            render() {
                return slottedHtml;
            }
        }

        const html = compileTemplate(`
            <template>
                <x-native-slotted-component-child>
                    <div>
                        test
                    </div>
                </x-native-slotted-component-child>
            </template>
        `, {
            modules: {
                'x-native-slotted-component-child': WithSlot,
            }
        });
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-native-slotted-component', { is: MyComponent });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot.querySelector('x-native-slotted-component-child').shadowRoot.querySelector('slot');
        const child = elm.shadowRoot.querySelector('div');
        expect(child.assignedSlot).toBe(slot);
    });

    it('should return correct slot when custom element is slotted', () => {
        class InsideSlot extends LightningElement {}

        const slottedHtml = compileTemplate(`
            <template>
                <slot></slot>
            </template>
        `);
        class WithSlot extends LightningElement {
            render() {
                return slottedHtml;
            }
        }

        const html = compileTemplate(`
            <template>
                <x-native-slotted-component-child>
                    <x-inside-slot></x-inside-slot>
                </x-native-slotted-component-child>
            </template>
        `, {
            modules: {
                'x-native-slotted-component-child': WithSlot,
                'x-inside-slot': InsideSlot,
            }
        });
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-native-slotted-component', { is: MyComponent });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot.querySelector('x-native-slotted-component-child').shadowRoot.querySelector('slot');
        const child = elm.shadowRoot.querySelector('x-inside-slot');
        expect(child.assignedSlot).toBe(slot);
    });

    it('should return null when native element default slot content', () => {
        const html = compileTemplate(`
            <template>
                <slot>
                    <div></div>
                </slot>
            </template>
        `);
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-assigned-slot', { is: MyComponent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('div');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return null when custom element default slot content', () => {
        class CustomElement extends LightningElement {}

        const html = compileTemplate(`
            <template>
                <slot>
                    <x-default-slot-custom-element></x-default-slot-custom-element>
                </slot>
            </template>
        `, {
            modules: {
                'x-default-slot-custom-element': CustomElement
            }
        });
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-assigned-slot', { is: MyComponent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-default-slot-custom-element');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return correct slot when text is slotted', () => {
        const slottedHtml = compileTemplate(`
            <template>
                <slot></slot>
            </template>
        `);
        class WithSlot extends LightningElement {
            render() {
                return slottedHtml;
            }
        }

        const html = compileTemplate(`
            <template>
                <x-native-slotted-component-child>
                    text
                </x-native-slotted-component-child>
            </template>
        `, {
            modules: {
                'x-native-slotted-component-child': WithSlot
            }
        });
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-native-slotted-component', { is: MyComponent });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot.querySelector('x-native-slotted-component-child').shadowRoot.querySelector('slot');
        const text = elm.shadowRoot.querySelector('x-native-slotted-component-child').childNodes[0];
        expect(text.assignedSlot).toBe(slot);
    });
});


describe('Node.getRootNode on patched elements', () => {
    afterEach(() => {
        while (document.body.childNodes.length > 0) {
            document.body.removeChild(document.body.childNodes[0]);
        }
    });

    const childHtml = compileTemplate(`<template><span class="child-cmp-span">txt</span><slot></slot></template>`);
    class ChildComponent extends LightningElement {
        render() {
            return childHtml;
        }
    }

    const containerHtml  = compileTemplate(`
            <template>
                <div id="container">
                    <div class="child-div">some text node</div>
                    <x-child><span class="child-cmp-slotted-span">txt</span></x-child>
                </div>
            </template>
        `, {
        modules: { 'x-child': ChildComponent }
    });
    class ContainerComponent extends LightningElement {
        render() {
            return containerHtml;
        }
    }

    const selectors: any = {};
    selectors.xChild = (elm) => getShadowRoot(elm)!.querySelector('x-child');
    selectors.xChildSpanInShadow = (elm) => getShadowRoot(selectors.xChild(elm))!.querySelector('.child-cmp-span');
    selectors.containerDiv = (elm) => getShadowRoot(elm)!.querySelector('.child-div');
    selectors.containerSlottedSpan = (elm) => getShadowRoot(elm)!.querySelector('.child-cmp-slotted-span');

    describe('when options.composed=true', () => {
        it('should return itself when node is disconnected', () => {
            const elm = createElement('x-container', { is: ContainerComponent });
            expect(elm.getRootNode({ composed: true })).toBe(elm);
        });

        it('should return document when request inside an lwc cmp', () => {
            const elm = createElement('x-container', { is: ContainerComponent });
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                expect(elm.getRootNode({ composed: true })).toBe(document);
            });
        });
        it('should return document when request in a hierarchy of lwc cmp', () => {
            const elm = createElement('x-container', { is: ContainerComponent });
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                const child = selectors.xChildSpanInShadow(elm);

                expect(child.getRootNode({ composed: true })).toBe(document);
            });
        });
        it('should return documentFragment the cmp is inside it', () => {
            class ContainerComponent extends LightningElement {
                render() {
                    return containerHtml;
                }
            }
            const elm = createElement('x-container', { is: ContainerComponent });

            const fragment = document.createDocumentFragment();
            fragment.appendChild(elm);

            return Promise.resolve().then(() => {
                expect(elm.getRootNode({ composed: true })).toBe(fragment);
            });
        });
    });

    describe('when options.composed=false', () => {
        it('should return itself when node is disconnected', () => {
            const elm = createElement('x-container', { is: ContainerComponent });
            expect(elm.getRootNode({ composed: false })).toBe(elm);
        });

        it('should return document as root when node is the root custom element', () => {
            const elm = createElement('x-container', { is: ContainerComponent });
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                expect(elm.getRootNode()).toBe(document);
            });
        });

        it('should return itself as root when node is a shadow', () => {
            const elm = createElement('x-container', { is: ContainerComponent });
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                expect(getShadowRoot(elm).getRootNode()).toBe(getShadowRoot(elm));
            });
        });

        it('should containing shadow of an element in the template of a component', () => {
            const elm = createElement('x-container', { is: ContainerComponent });
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                const childDiv = selectors.containerDiv(elm);
                expect(childDiv!.getRootNode()).toBe(getShadowRoot(elm));
            });
        });

        it('should containing shadow when node is a component custom element', () => {
            const elm = createElement('x-container', { is: ContainerComponent });
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                const childCmp = selectors.xChild(elm);
                expect(childCmp.getRootNode()).toBe(getShadowRoot(elm));
            });
        });

        it('should return containing shadow when the node is in a component hierachy', () => {
            const elm = createElement('x-container', { is: ContainerComponent });
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                const spanInChildCmp = selectors.xChildSpanInShadow(elm);
                expect(spanInChildCmp!.getRootNode()).toBe(getShadowRoot(selectors.xChild(elm)));
            });
        });

        it('should return containing shadow when node is inside a slot', () => {
            const elm = createElement('x-container', { is: ContainerComponent });
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                const spanInChildCmp = selectors.containerSlottedSpan(elm);
                expect(spanInChildCmp!.getRootNode()).toBe(getShadowRoot(elm));
            });
        });
    });
});
