import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../../framework/main';
import { getHostShadowRoot } from '../../framework/html-element';

describe('root', () => {
    describe('integration', () => {
        it.skip('should support this.template.host', () => {});

        it('should support this.template.mode', () => {
            class MyComponent extends LightningElement {}

            const elm = createElement('x-foo', { is: MyComponent });
            expect(getHostShadowRoot(elm).mode).toBe('closed');
        });

        it('should allow searching for elements from template', () => {
            const myComponentTmpl = compileTemplate(`
                <template>
                    <p></p>
                </template>
            `);
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                const nodes = getHostShadowRoot(elm).querySelectorAll('p');
                expect(nodes).toHaveLength(1);
            });
        });

        it('should allow searching for one element from template', () => {
            const myComponentTmpl = compileTemplate(`
                <template>
                    <p></p>
                </template>
            `);
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                const node = getHostShadowRoot(elm).querySelector('p');
                expect(node.tagName).toBe('P');
            });
        });

        it('should ignore slotted elements when queried via querySelectorAll', () => {
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
                    <x-child>
                        <p></p>
                    </x-child>
                </template>
            `, {
                modules: { 'x-child': Child },
            });
            class Parent extends LightningElement {
                render() {
                    return parentTmpl;
                }
            }

            const elm = createElement('x-foo', { is: Parent });
            document.body.appendChild(elm);

            expect(getHostShadowRoot(elm).querySelectorAll('p')).toHaveLength(1);

            const xChild = getHostShadowRoot(elm).querySelector('x-child');
            expect(getHostShadowRoot(xChild).querySelectorAll('p')).toHaveLength(0);
        });

        it('should ignore slotted elements when queried via querySelector', () => {
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
                    <x-child>
                        <p></p>
                    </x-child>
                </template>
            `, {
                modules: { 'x-child': Child },
            });
            class Parent extends LightningElement {
                render() {
                    return parentTmpl;
                }
            }

            const elm = createElement('x-foo', { is: Parent });
            document.body.appendChild(elm);

            expect(getHostShadowRoot(elm).querySelector('p')).not.toBeNull();

            const xChild = getHostShadowRoot(elm).querySelector('x-child');
            expect(getHostShadowRoot(xChild).querySelector('p')).toBeNull();
        });


        it('should expose the shadow root via $$ShadowRoot$$ when in test mode', () => {
            class MyComponent extends LightningElement {}

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(elm.$$ShadowRoot$$).toBeDefined();
        });

    });

    describe('childNodes', () => {
        it('should return array of childnodes', () => {
            const myComponentTmpl = compileTemplate(`
                <template>
                    <div>
                        <span></span>
                    </div>
                    <p></p>
                </template>
            `);
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }

            const elem = createElement('x-shadow-child-nodes', { is: MyComponent });
            document.body.appendChild(elem);
            const children = getHostShadowRoot(elem).childNodes;
            expect(children).toHaveLength(2);
            expect(children[0]).toBe(
                getHostShadowRoot(elem).querySelector('div')
            );
            expect(children[1]).toBe(
                getHostShadowRoot(elem).querySelector('p')
            );
        });
    });
    describe('.firstChild', () => {
        it('should return the first child', () => {
            const myComponentTmpl = compileTemplate(`
                <template>
                    <div></div>
                    <p></p>
                </template>
            `);
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }

            const elem = createElement('x-shadow-child-nodes', { is: MyComponent });
            document.body.appendChild(elem);
            const first = getHostShadowRoot(elem).firstChild;
            expect(first).toBe(
                getHostShadowRoot(elem).querySelector('div')
            );
        });
        it('could be a text node', () => {
            const myComponentTmpl = compileTemplate(`
                <template>
                    first-text-node
                    <div></div>
                </template>
            `);
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }

            const elem = createElement('x-shadow-child-nodes', { is: MyComponent });
            document.body.appendChild(elem);
            const first = getHostShadowRoot(elem).firstChild;
            expect(first.textContent).toBe('first-text-node');
        });
    });

    describe('.lastChild', () => {
        it('should return the last child', () => {
            const myComponentTmpl = compileTemplate(`
                <template>
                    <div></div>
                    <p></p>
                </template>
            `);
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }

            const elem = createElement('x-shadow-child-nodes', { is: MyComponent });
            document.body.appendChild(elem);
            const last = getHostShadowRoot(elem).lastChild;
            expect(last).toBe(
                getHostShadowRoot(elem).querySelector('p')
            );
        });
        it('could be a text node', () => {
            const myComponentTmpl = compileTemplate(`
                <template>
                    <div></div>
                    last-text-node
                </template>
            `);
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }

            const elem = createElement('x-shadow-child-nodes', { is: MyComponent });
            document.body.appendChild(elem);
            const last = getHostShadowRoot(elem).lastChild;
            expect(last.textContent).toBe('last-text-node');
        });
    });
    describe('.contains', () => {
        it('should implements shadow dom semantics', () => {
            const myChildTmpl = compileTemplate(`
                <template>
                    <p></p>
                </template>
            `);
            class MyChild extends LightningElement {
                render() {
                    return myChildTmpl;
                }
            }

            const myComponentTmpl = compileTemplate(`
                <template>
                    <div>
                        <x-child></x-child>
                    </div>
                    just text
                </template>
            `, {
                modules: {
                    'x-child': MyChild,
                }
            });
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }

            const elem = createElement('x-shadow-parent', { is: MyComponent });
            document.body.appendChild(elem);
            const root = getHostShadowRoot(elem);
            const div = root.querySelector('div');
            const child = root.querySelector('x-child');
            const text = root.lastChild;
            const childRoot = getHostShadowRoot(child as HTMLElement);
            const p = childRoot.querySelector('p');
            expect(root.contains(document.body)).toBe(false);
            expect(root.contains(div)).toBe(true);
            expect(root.contains(child)).toBe(true);
            expect(root.contains(text)).toBe(true);
            expect(root.contains(p)).toBe(false);
            expect(childRoot.contains(p)).toBe(true);
            expect(childRoot.contains(div)).toBe(false);
            expect(childRoot.contains(child)).toBe(false);
        });
    });
    describe('.compareDocumentPosition', () => {
        it('should implements shadow dom semantics', () => {
            const myChildTmpl = compileTemplate(`
                <template>
                    <p></p>
                </template>
            `);
            class MyChild extends LightningElement {
                render() {
                    return myChildTmpl;
                }
            }

            const myComponentTmpl = compileTemplate(`
                <template>
                    <div>
                        <x-child></x-child>
                    </div>
                    just text
                </template>
            `, {
                modules: {
                    'x-child': MyChild,
                }
            });
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }

            const elem = createElement('x-shadow-parent', { is: MyComponent });
            document.body.appendChild(elem);
            const root = getHostShadowRoot(elem);
            const div = root.querySelector('div');
            const child = root.querySelector('x-child');
            const text = root.lastChild;
            const childRoot = getHostShadowRoot(child as HTMLElement);
            const p = childRoot.querySelector('p');
            const {
                DOCUMENT_POSITION_DISCONNECTED,
                DOCUMENT_POSITION_FOLLOWING,
                DOCUMENT_POSITION_PRECEDING,
                DOCUMENT_POSITION_CONTAINED_BY,
            } = Node;
            expect((root.compareDocumentPosition(document.body) & DOCUMENT_POSITION_DISCONNECTED)).toBeGreaterThan(0);
            expect((root.compareDocumentPosition(div) & DOCUMENT_POSITION_CONTAINED_BY)).toBeGreaterThan(0);
            expect((root.compareDocumentPosition(child) & DOCUMENT_POSITION_CONTAINED_BY)).toBeGreaterThan(0);
            expect((root.compareDocumentPosition(text) & DOCUMENT_POSITION_CONTAINED_BY)).toBeGreaterThan(0);
            // p belongs to a child shadow
            expect((root.compareDocumentPosition(p) & DOCUMENT_POSITION_DISCONNECTED)).toBeGreaterThan(0);
            expect((root.compareDocumentPosition(p) & DOCUMENT_POSITION_FOLLOWING)).toBeGreaterThan(0);
            // div belongs to owner shadow
            expect((childRoot.compareDocumentPosition(div) & DOCUMENT_POSITION_DISCONNECTED)).toBeGreaterThan(0);
            // x-child is the host of childRoot
            expect((childRoot.compareDocumentPosition(child) & DOCUMENT_POSITION_DISCONNECTED)).toBeGreaterThan(0);
            expect((childRoot.compareDocumentPosition(child) & DOCUMENT_POSITION_PRECEDING)).toBeGreaterThan(0);
        });
    });
    describe('.hasChildNodes', () => {
        it('should return false when no child is added to the shadow root', () => {
            const myComponentTmpl = compileTemplate(`
                <template></template>
            `);
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }

            const elem = createElement('x-shadow-parent', { is: MyComponent });
            document.body.appendChild(elem);
            const root = getHostShadowRoot(elem);
            expect(root.hasChildNodes()).toBe(false);
        });
        it('should return false for empty shadow root', () => {
            const myComponentTmpl = compileTemplate(`
                <template></template>
            `);
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }

            const elem = createElement('x-shadow-parent', { is: MyComponent });
            document.body.appendChild(elem);
            const root = getHostShadowRoot(elem);
            expect(root.hasChildNodes()).toBe(false);
        });
        it('should return true when at least a text node is present', () => {
            const myComponentTmpl = compileTemplate(`
                <template>
                    something
                </template>
            `);
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }

            const elem = createElement('x-shadow-parent', { is: MyComponent });
            document.body.appendChild(elem);
            const root = getHostShadowRoot(elem);
            expect(root.hasChildNodes()).toBe(true);
        });
        it('should return true when at least a slot is present', () => {
            const myComponentTmpl = compileTemplate(`
                <template>
                    <slot name="something"></slot>
                </template>
            `);
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }

            const elem = createElement('x-shadow-parent', { is: MyComponent });
            document.body.appendChild(elem);
            const root = getHostShadowRoot(elem);
            expect(root.hasChildNodes()).toBe(true);
        });
    });

    describe('.parentElement', () => {
        it('should return null on child node', () => {
            const myComponentTmpl = compileTemplate(`
                <template>
                    <div></div>
                    <p></p>
                </template>
            `);
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }

            const elem = createElement('x-shadow-child-nodes', { is: MyComponent });
            document.body.appendChild(elem);
            const first = getHostShadowRoot(elem).firstChild;
            expect(first.parentElement).toBe(null);
        });
    });
});
