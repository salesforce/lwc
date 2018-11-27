import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../../framework/main';
import { SyntheticShadowRoot, attachShadow } from "../shadow-root";

describe('root', () => {
    describe('constructor', () => {
        it('should throw when calling constructor', () => {
            expect(() => {
                new SyntheticShadowRoot();
            }).toThrow('Illegal constructor');
        });
    });
    describe('integration', () => {
        it('should support template.host', () => {
            const html = compileTemplate(`
                <template></template>
            `);
            class Parent extends LightningElement {
                getHost() {
                    return this.template.host;
                }
                render() {
                    return html;
                }
            }
            Parent.publicMethods = ['getHost'];
            const elm = createElement('x-parent', { is: Parent });
            expect(elm.getHost()).toBe(elm);
            expect(elm.shadowRoot.host).toBe(elm);
        });

        it('should support this.template.mode', () => {
            class MyComponent extends LightningElement {}

            const elm = createElement('x-foo', { is: MyComponent });
            expect(elm.shadowRoot.mode).toBe('open');
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
                const nodes = elm.shadowRoot.querySelectorAll('p');
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
                const node = elm.shadowRoot.querySelector('p');
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

            expect(elm.shadowRoot.querySelectorAll('p')).toHaveLength(1);

            const xChild = elm.shadowRoot.querySelector('x-child');
            expect(xChild.shadowRoot.querySelectorAll('p')).toHaveLength(0);
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

            expect(elm.shadowRoot.querySelector('p')).not.toBeNull();

            const xChild = elm.shadowRoot.querySelector('x-child');
            expect(xChild.shadowRoot.querySelector('p')).toBeNull();
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
            const children = elem.shadowRoot.childNodes;
            expect(children).toHaveLength(2);
            expect(children[0]).toBe(
                elem.shadowRoot.querySelector('div')
            );
            expect(children[1]).toBe(
                elem.shadowRoot.querySelector('p')
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
            const first = elem.shadowRoot.firstChild;
            expect(first).toBe(
                elem.shadowRoot.querySelector('div')
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
            const first = elem.shadowRoot.firstChild;
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
            const last = elem.shadowRoot.lastChild;
            expect(last).toBe(
                elem.shadowRoot.querySelector('p')
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
            const last = elem.shadowRoot.lastChild;
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
            const root = elem.shadowRoot;
            const div = root.querySelector('div');
            const child = root.querySelector('x-child');
            const text = root.lastChild;
            const childRoot = child.shadowRoot;
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
            const root = elem.shadowRoot;
            const div = root.querySelector('div');
            const child = root.querySelector('x-child');
            const text = root.lastChild;
            const childRoot = child.shadowRoot;
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
            const root = elem.shadowRoot;
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
            const root = elem.shadowRoot;
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
            const root = elem.shadowRoot;
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
            const root = elem.shadowRoot;
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
            const first = elem.shadowRoot.firstChild;
            expect(first.parentElement).toBe(null);
        });
    });

    describe('API', () => {
        it('should be a fragment', () => {
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
            const { shadowRoot } = elem;
            expect(shadowRoot.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);
            expect(shadowRoot.nodeName).toBe('#document-fragment');
            expect(shadowRoot.nodeValue).toBe(null);
            expect(shadowRoot.namespaceURI).toBe(null);
            expect(shadowRoot.nextSibling).toBe(null);
            expect(shadowRoot.previousSibling).toBe(null);
            expect(shadowRoot.nextElementSibling).toBe(null);
            expect(shadowRoot.previousElementSibling).toBe(null);
            expect(shadowRoot.localName).toBe(null);
            expect(shadowRoot.prefix).toBe(undefined);
            expect(shadowRoot.ownerDocument).toBe(elem.ownerDocument);
            expect(shadowRoot.baseURI).toBe(elem.baseURI);
            expect(shadowRoot.isConnected).toBe(true);
            expect(shadowRoot.parentElement).toBe(null);
            expect(shadowRoot.parentNode).toBeNull();
        });

        it('should be a parentNode', () => {
            const myComponentTmpl = compileTemplate(`
                <template>
                    some text
                    <div></div>
                    <p></p>
                    some other text
                </template>
            `);
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }

            const elem = createElement('x-shadow-child-nodes', { is: MyComponent });
            document.body.appendChild(elem);
            const { shadowRoot } = elem;
            expect(shadowRoot.children.length).toBe(2);
            expect(shadowRoot.childElementCount).toBe(2);
            expect(shadowRoot.firstElementChild.tagName).toBe('DIV');
            expect(shadowRoot.lastElementChild.tagName).toBe('P');
            expect(shadowRoot.childNodes.length).toBe(4);
        });

        it('should compute the proper textContent', () => {
            const myComponentTmpl = compileTemplate(`
                <template>
                    1
                    <div>2</div>
                    <p>3</p>
                    4
                </template>
            `);
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }

            const elem = createElement('x-shadow-child-nodes', { is: MyComponent });
            document.body.appendChild(elem);
            const { shadowRoot } = elem;
            expect(shadowRoot.textContent).toBe(`1234`);
        });
        it('should compute the proper innerHTML', () => {
            const myComponentTmpl = compileTemplate(`
                <template>
                    1
                    <div>2</div>
                    <p>3</p>
                    4
                </template>
            `);
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }

            const elem = createElement('x-shadow-child-nodes', { is: MyComponent });
            document.body.appendChild(elem);
            const { shadowRoot } = elem;
            expect(shadowRoot.innerHTML).toBe(`1<div>2</div><p>3</p>4`);
        });
    });
    describe('errors', () => {
        it('should not allow calling attachShadow twice', () => {
            const elm = document.createElement('x-foo');
            attachShadow(elm, { mode: 'open' });
            expect(() => {
                attachShadow(elm, { mode: 'open' });
            }).toThrow();

        });
    });
});
