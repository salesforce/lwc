import { Element } from "../../html-element";
import { createElement } from "../../upgrade";
import assertLogger from '../../assert';
import { register } from "../../services";
import { VNode } from "../../../3rdparty/snabbdom/types";
import { Component } from "../../component";
import { unwrap } from "../../main";
import { querySelector } from "../element";

describe('#lightDomQuerySelectorAll()', () => {
    describe('Invoked from within component', () => {
        it('should allow searching for passed elements', () => {
            function tmpl$1($api, $cmp, $slotset, $ctx) {
                return [$api.s('', {
                    key: 0,
                    attrs: {
                        name: ''
                    }
                }, [], $slotset)];
            }
            tmpl$1.slots = [""];

            class Parent extends Element {
                render() {
                    return tmpl$1;
                }

            }

            function tmpl$2($api, $cmp, $slotset, $ctx) {
                const {
                    t: api_text,
                    h: api_element,
                    c: api_custom_element
                } = $api;

                return [
                    api_custom_element("x-parent", Parent, {
                        key: 1,
                    }, [
                        api_element("div", {
                                key: 2,
                                classMap: {
                                    first: true
                                }
                            },
                            [api_text("First")]
                        ), api_element("div", {
                                key: 3,
                                classMap: {
                                    second: true
                                }
                            },
                            [api_text("Second")]
                        )
                    ])];
            }

            class LightdomQuerySelector extends Element {
                render() {
                    return tmpl$2;
                }

            }

            const element = createElement('lightdom-queryselector', { is: LightdomQuerySelector });
            document.body.appendChild(element);
            const nested = element.shadowRoot.querySelector('x-parent').querySelectorAll('div');
            expect(nested).toHaveLength(2);
            expect(nested[0]).toBe(querySelector.call(element, '.first'));
            expect(nested[1]).toBe(querySelector.call(element, '.second'));
        });

        it('should ignore elements passed to its slot', () => {
            function parentHTML($api) {
                return [
                    $api.c('x-child', Child, {}),
                ];
            }

            class Parent extends Element {
                queryChildDiv() {
                    return this.querySelectorAll('div');
                }
            }

            Parent.methods = ['queryChildDiv'];

            function renderChildHTML($api, $cmp, $slotset) {
                return $slotset.x;
            }

            class Child extends Element {
                render() {
                    return renderChildHTML;
                }
            }

            const elm = createElement('x-parent', { is: Parent });
            expect(elm.querySelector('div')).toBe(querySelector.call(elm, 'div'));
        });

        it('should ignore elements from template', () => {
            function html1($api) {
                return [$api.h('p', { key: 0 }, [])];
            }
            class Child extends Element {
                render() {
                    return html1;
                }
            }
            function html2($api) {
                return [$api.c('x-child', Child, { key: 0 }, [])];
            }
            class Parent extends Element {
                render() {
                    return html2;
                }
            }
            const elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);
            expect(elm.shadowRoot.querySelector('x-child').querySelectorAll('p')).toHaveLength(0);
        });

        it('should not throw an error if no nodes are found', () => {
            function html($api) {
                return [$api.h('p', { key: 0 }, [])];
            }
            const def = class MyComponent extends Element {
                render() {
                    return html;
                }
            };
            const elm = createElement('should-not-throw-an-error-if-no-nodes-are-found', { is: def });
            document.body.appendChild(elm);
            expect(() => {
                elm.shadowRoot.querySelectorAll('div');
            }).not.toThrow();
        });
    });

    describe('Invoked from element instance', () => {
        it('should allow searching for passed elements', () => {
            function tmpl$1($api, $cmp, $slotset, $ctx) {
                return [$api.s('', {
                    key: 0,
                    attrs: {
                        name: ''
                    }
                }, [], $slotset)];
            }
            tmpl$1.slots = [""];

            class Parent extends Element {
                render() {
                    return tmpl$1;
                }

            }

            function tmpl$2($api, $cmp, $slotset, $ctx) {
                const {
                    t: api_text,
                    h: api_element,
                    c: api_custom_element
                } = $api;

                return [
                    api_custom_element("x-parent", Parent, {
                        key: 1,
                    }, [
                        api_element("div", {
                                key: 2,
                                classMap: {
                                    first: true
                                }
                            },
                            [api_text("First")]
                        ), api_element("div", {
                                key: 3,
                                classMap: {
                                    second: true
                                }
                            },
                            [api_text("Second")]
                        )
                    ])];
            }

            class LightdomQuerySelector extends Element {
                render() {
                    return tmpl$2;
                }
            }

            const element = createElement('lightdom-queryselector', { is: LightdomQuerySelector });
            document.body.appendChild(element);
            const nested = element.shadowRoot.querySelector('x-parent').querySelectorAll('div');
            expect(nested).toHaveLength(2);
            expect(nested[0]).toBe(querySelector.call(element, '.first'));
            expect(nested[1]).toBe(querySelector.call(element, '.second'));
        });
    });
});

describe('#lightDomQuerySelector()', () => {
    it('should allow searching for the passed element', () => {
        function tmpl$1($api, $cmp, $slotset, $ctx) {
            return [$api.s('', {
                key: 0,
                attrs: {
                    name: ''
                }
            }, [], $slotset)];
        }
        tmpl$1.slots = [""];

        class Parent extends Element {
            render() {
                return tmpl$1;
            }

        }

        function tmpl$2($api, $cmp, $slotset, $ctx) {
            const {
                t: api_text,
                h: api_element,
                c: api_custom_element
            } = $api;

            return [
                api_custom_element("x-parent", Parent, {
                    key: 1,
                }, [
                    api_element("div", {
                            key: 2,
                            classMap: {
                                first: true
                            }
                        },
                        [api_text("First")]
                    ), api_element("div", {
                            key: 3,
                            classMap: {
                                second: true
                            }
                        },
                        [api_text("Second")]
                    )
                ])];
        }

        class LightdomQuerySelector extends Element {
            render() {
                return tmpl$2;
            }
        }

        const element = createElement('lightdom-queryselector', { is: LightdomQuerySelector });
        document.body.appendChild(element);
        const div = element.shadowRoot.querySelector('x-parent').querySelector('div');
        expect(div).toBe(querySelector.call(element, '.first'));
    });

    it('should ignore element from template', () => {
        function html1($api) {
            return [$api.h('p', { key: 0 }, [])];
        }
        class Child extends Element {
            render() {
                return html1;
            }
        }
        function html2($api) {
            return [$api.c('x-child', Child, { key: 0 }, [])];
        }
        class Parent extends Element {
            render() {
                return html2;
            }
        }
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.querySelector('x-child').querySelector('p')).toBeNull();
    });

    it('should not throw an error if element does not exist', () => {
        function html($api) {
            return [$api.h('p', { key: 0 }, [])];
        }
        const def = class MyComponent extends Element {
            render() {
                return html;
            }
        };
        const elm = createElement('x-foo', { is: def });
        document.body.appendChild(elm);
        expect(() => {
            elm.shadowRoot.querySelector('div');
        }).not.toThrow();
    });

    it('should return null if element does not exist', function () {
        function html($api) {
            return [$api.h('p', { key: 0 }, [])];
        }
        const def = class MyComponent extends Element {
            render() {
                return html;
            }
        };
        const elm = createElement('x-foo', { is: def });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.querySelector('div')).toBeNull();
    });
});

describe('#shadowRootQuerySelector', () => {
    it('should querySelector on element from template', () => {
        function html($api) { return [$api.h('ul', { key: 0 }, [$api.h('li', { key: 1 }, [])])]; }
        class MyComponent extends Element {
            render() {
                return html;
            }
        }
        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            const ul = elm.shadowRoot.querySelector('ul');
            expect(ul);
            const li = ul.querySelector('li');
            expect(li);
        });
    });

    it('should not reach into child components template when querySelector invoked on child custom element', () => {
        expect.assertions(1);
        class MyChild extends Element {
            render() {
                return function($api) {
                    return [$api.h('div', {
                        key: 0,
                    }, [])];
                };
            }
        }

        function html($api, $cmp) {
            return [$api.c('membrane-parent-query-selector-child-custom-element-child', MyChild, {})];
        }

        class MyComponent extends Element {
            render() {
                return html;
            }
        }

        const elm = createElement('membrane-parent-query-selector-child-custom-element', { is: MyComponent });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.querySelector('membrane-parent-query-selector-child-custom-element-child').querySelector('div')).toBe(null);
    });

    it('should querySelectorAll on element from template', () => {
        function html($api) { return [$api.h('ul', { key: 0 }, [$api.h('li', { key: 1 }, [])])]; }
        class MyComponent extends Element {
            render() {
                return html;
            }
        }
        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            const ul = (elm.shadowRoot.querySelectorAll('ul')[0];
            expect(ul);
            const li = ul.querySelectorAll('li')[0];
            expect(li);
        });
    });

    it('should ignore elements not defined in template', () => {
        function html($api) { return [$api.h('ul', { key: 0 }, [])]; }
        class MyComponent extends Element {
            render() {
                return html;
            }
        }
        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            const ul = (elm.shadowRoot.querySelector('ul');
            expect(ul);
            ul.appendChild(document.createElement('li'));
            const li1 = ul.querySelectorAll('li')[0];
            expect(li1).toBeUndefined();
            const li2 = ul.querySelector('li');
            expect(li2).toBeNull();
        });
    });

    it('should not throw error if querySelector does not match any elements', () => {
        function html($api) { return [$api.h('ul', { key: 0 }, [])]; }
        class MyComponent extends Element {
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            expect(() => {
                elm.shadowRoot.querySelector('doesnotexist');
            }).not.toThrow();
        });
    });

    it('should return null if querySelector does not match any elements', () => {
        function html($api) { return [$api.h('ul', { key: 0 }, [])]; }
        class MyComponent extends Element {
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('doesnotexist')).toBeNull();
        });
    });

    it('should not throw error if querySelectorAll does not match any elements', () => {
        function html($api) {
            return [$api.h('ul', { key: 0 }, [])];
        }
        class MyComponent extends Element {
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            expect(() => {
                elm.shadowRoot.querySelectorAll('doesnotexist');
            }).not.toThrow();
        });
    });

    it('should not expose shadow root on child custom element', () => {
        expect.assertions(1);
        let childTemplate;
        class MyChild extends Element {
            constructor() {
                super();
                childTemplate = this.template;
            }

            render() {
                return function($api) {
                    return [$api.h('div', {
                        key: 0,
                    }, [])];
                };
            }
        }

        function html($api, $cmp) {
            return [$api.c('x-child-parent-shadow-root', MyChild, {
                on: {
                    click: $api.b($cmp.handleClick)
                }
            })];
        }

        class MyComponent extends Element {
            handleClick(evt) {
                expect(evt.target.parentNode).not.toBe(childTemplate);
            }

            render() {
                return html;
            }
        }

        const elm = createElement('membrane-child-parent-shadow-root-parent', { is: MyComponent });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            elm.shadowRoot.querySelector('x-child-parent-shadow-root').shadowRoot.querySelector('div').click();
        });
    });
});

describe('#parentNode and #parentElement', () => {
    it('should allow walking back to the shadow root', () => {
        function html($api) {
            return [$api.h('div', { key: 0 }, [])];
        }
        class MyComponent extends Element {
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            const root = elm.shadowRoot;
            expect(root.querySelector('div').parentElement).toBe(root);
        });
    });

    it('should allow walking back to the shadow root via parentElement', () => {
        function html($api) {
            return [$api.h('div', { key: 0 }, [])];
        }
        class MyComponent extends Element {
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            const root = elm.shadowRoot;
            expect(root.querySelector('div').parentElement).toBe(root);
        });
    });
});


describe('#childNodes', () => {
    it('should always return an empty array for slots not rendering default content', () => {
        function tmpl($api, $cmp, $slotset) {
            return [
                $api.s('', {
                    key: 0,
                }, [
                    $api.h('div', {
                        key: 2,
                    } ,[]),
                ], $slotset),
            ];
        }
        tmpl.slots = [''];

        class HasSlot extends Element {
            render() {
                return tmpl;
            }
        }

        class Parent extends Element {
            render() {
                return function ($api) {
                    return [
                        $api.c('x-child-node-with-slot', HasSlot, {}, [
                            $api.h('p', {
                                key: 1,
                            }, []),
                        ]),
                    ];
                }
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot.querySelector('x-child-node-with-slot').shadowRoot.querySelector('slot');
        expect(slot.childNodes).toHaveLength(0);
    });

    it('should return correct elements for slots rendering default content', () => {
        function tmpl($api, $cmp, $slotset) {
            return [
                $api.s('', {
                    key: 0,
                }, [
                    $api.h('div', {
                        key: 2,
                    } ,[]),
                ], $slotset),
            ];
        }
        tmpl.slots = [''];

        class HasSlot extends Element {
            render() {
                return tmpl;
            }
        }

        class Parent extends Element {
            render() {
                return function ($api) {
                    return [
                        $api.c('x-child-node-with-slot', HasSlot, {}, []),
                    ];
                }
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot.querySelector('x-child-node-with-slot').shadowRoot.querySelector('slot');
        expect(slot.childNodes).toHaveLength(1);
    });

    it('should return correct elements for non-slot elements', () => {
        class Parent extends Element {
            render() {
                return function ($api) {
                    return [
                        $api.h('div', {
                            key: 0,
                        }, [
                            $api.h('p', {
                                key: 1,
                            }, []),
                        ]),
                    ];
                }
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('div');
        const childNodes = child.childNodes;
        expect(childNodes).toHaveLength(1);
        expect(childNodes[0]).toBe(elm.shadowRoot.querySelector('p'));
    });

    it('should return correct elements for custom elements when no children present', () => {
        function tmpl($api) {
            return [
                $api.h('div', {
                    key: 3,
                }, []),
            ]
        }
        class Child extends Element {
            render() {
                return tmpl;
            }
        }

        class Parent extends Element {
            render() {
                return function ($api) {
                    return [
                        $api.h('div', {
                            key: 0,
                        }, [
                            $api.c('x-child', Child, {
                                key: 1,
                            }, []),
                        ]),
                    ];
                }
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-child');
        const childNodes = child.childNodes;
        expect(childNodes).toHaveLength(0);
    });

    it('should return correct elements for custom elements when children present', () => {
        function tmpl($api, $cmp, $slotset) {
            return [
                $api.s('', {
                    key: 3,
                }, [], $slotset),
            ]
        }
        class Child extends Element {
            render() {
                return tmpl;
            }
        }

        class Parent extends Element {
            render() {
                return function ($api) {
                    return [
                        $api.h('div', {
                            key: 0,
                        }, [
                            $api.c('x-child', Child, {
                                key: 1,
                            }, [
                                $api.h('p', {
                                    key: 4,
                                } ,[])
                            ]),
                        ]),
                    ];
                }
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-child');
        const childNodes = child.childNodes;
        expect(childNodes).toHaveLength(1);
    });
});
