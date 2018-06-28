import { createElement, Element } from '../../main';
import { getHostShadowRoot } from '../../html-element';
import { h } from '../../api';

describe('root', () => {
    describe('integration', () => {
        it.skip('should support this.template.host', () => {});

        it('should support this.template.mode', () => {
            class MyComponent extends Element {}
            const elm = createElement('x-foo', { is: MyComponent });
            expect(getHostShadowRoot(elm).mode).toBe('closed');
        });

        it('should allow searching for elements from template', () => {
            function html($api) { return [$api.h('p', { key: 0 }, [])]; }
            class MyComponent extends Element {
                render() {
                    return html;
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
            function html($api) {
                return [$api.h('p', { key: 0 }, [])];
            }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                const node = getHostShadowRoot(elm).querySelector('p');
                expect(node.tagName).toBe('P');
            });
        });

        it('should ignore elements from other owner', () => {
            const vnodeFromAnotherOwner = h('p', { key: 0 }, []);
            function html() { return [vnodeFromAnotherOwner]; }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                const nodes = getHostShadowRoot(elm).querySelectorAll('p');
                expect(nodes).toHaveLength(0);
            });
        });

        it('should ignore element from other owner', () => {
            const vnodeFromAnotherOwner = h('p', { key: 0 }, []);
            function html() { return [vnodeFromAnotherOwner]; }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                const node = getHostShadowRoot(elm).querySelector('p');
                expect(node).toBeNull();
            });
        });

        it('should expose the shadow root via $$ShadowRoot$$ when in test mode', () => {
            class MyComponent extends Element {}
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(elm.$$ShadowRoot$$).toBeDefined();
        });

    });

    describe('childNodes', () => {
        it('should return array of childnodes', () => {
            function tmpl($api) {
                return [
                    $api.h('div', {
                        key: 0,
                    }, [
                        $api.h('span', {
                            key: 1,
                        } , []),
                    ]),
                    $api.h('p', {
                        key: 2,
                    } , [

                    ]),
                ];
            }
            class MyComponent extends Element {
                render() {
                    return tmpl;
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
            function tmpl($api) {
                return [
                    $api.h('div', {
                        key: 0,
                    }, []),
                    $api.h('p', {
                        key: 2,
                    }, []),
                ];
            }
            class MyComponent extends Element {
                render() {
                    return tmpl;
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
            function tmpl($api) {
                return [
                    $api.t('first-text-node'),
                    $api.h('div', {
                        key: 0,
                    }, []),
                ];
            }
            class MyComponent extends Element {
                render() {
                    return tmpl;
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
            function tmpl($api) {
                return [
                    $api.h('div', {
                        key: 0,
                    }, []),
                    $api.h('p', {
                        key: 2,
                    }, []),
                ];
            }
            class MyComponent extends Element {
                render() {
                    return tmpl;
                }
            }

            const elem = createElement('x-shadow-child-nodes', { is: MyComponent });
            document.body.appendChild(elem);
            const last = getHostShadowRoot(elem).lastChild;
            expect(last).toBe(
                getHostShadowRoot(elem).querySelector('p')
            );
        });
        it('should return the last child', () => {
            function tmpl($api) {
                return [
                    $api.h('div', {
                        key: 0,
                    }, []),
                    $api.t('last-text-node'),
                ];
            }
            class MyComponent extends Element {
                render() {
                    return tmpl;
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
            function tmpl1($api) {
                return [
                    $api.h('p', {
                        key: 2,
                    }, []),
                ];
            }
            class MyChild extends Element {
                render() {
                    return tmpl1;
                }
            }
            function tmpl2($api) {
                return [
                    $api.h('div', {
                        key: 0,
                    }, [
                        $api.c('x-child', MyChild, {}, []),
                    ]),
                    $api.t('just text'),
                ];
            }
            class MyComponent extends Element {
                render() {
                    return tmpl2;
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
            function tmpl1($api) {
                return [
                    $api.h('p', {
                        key: 2,
                    }, []),
                ];
            }
            class MyChild extends Element {
                render() {
                    return tmpl1;
                }
            }
            function tmpl2($api) {
                return [
                    $api.h('div', {
                        key: 0,
                    }, [
                        $api.c('x-child', MyChild, {}, []),
                    ]),
                    $api.t('just text'),
                ];
            }
            class MyComponent extends Element {
                render() {
                    return tmpl2;
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
            function tmpl2($api) {
                return [];
            }
            class MyComponent extends Element {
                render() {
                    return tmpl2;
                }
            }

            const elem = createElement('x-shadow-parent', { is: MyComponent });
            document.body.appendChild(elem);
            const root = getHostShadowRoot(elem);
            expect(root.hasChildNodes()).toBe(false);
        });
        it('should return false for empty shadow root', () => {
            function tmpl2($api) {
                return [];
            }
            class MyComponent extends Element {
                render() {
                    return tmpl2;
                }
            }

            const elem = createElement('x-shadow-parent', { is: MyComponent });
            document.body.appendChild(elem);
            const root = getHostShadowRoot(elem);
            expect(root.hasChildNodes()).toBe(false);
        });
        it('should return true when at least a text node is present', () => {
            function tmpl2($api) {
                return [$api.t('something')];
            }
            class MyComponent extends Element {
                render() {
                    return tmpl2;
                }
            }

            const elem = createElement('x-shadow-parent', { is: MyComponent });
            document.body.appendChild(elem);
            const root = getHostShadowRoot(elem);
            expect(root.hasChildNodes()).toBe(true);
        });
        it('should return true when at least a slot is present', () => {
            function tmpl2($api, $cmp, $slotset) {
                return [$api.s('something', {key: 0}, [], $slotset)];
            }
            class MyComponent extends Element {
                render() {
                    return tmpl2;
                }
            }

            const elem = createElement('x-shadow-parent', { is: MyComponent });
            document.body.appendChild(elem);
            const root = getHostShadowRoot(elem);
            expect(root.hasChildNodes()).toBe(true);
        });
    });
});
