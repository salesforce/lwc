import { Element, getHostShadowRoot, getHostChildNodes } from "../../html-element";
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
            const nested = getHostShadowRoot(element).querySelector('x-parent').querySelectorAll('div');
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
            expect(getHostShadowRoot(elm).querySelector('x-child').querySelectorAll('p')).toHaveLength(0);
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
                getHostShadowRoot(elm).querySelectorAll('div');
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
            const nested = getHostShadowRoot(element).querySelector('x-parent').querySelectorAll('div');
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
        const div = getHostShadowRoot(element).querySelector('x-parent').querySelector('div');
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
        expect(getHostShadowRoot(elm).querySelector('x-child').querySelector('p')).toBeNull();
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
            getHostShadowRoot(elm).querySelector('div');
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
        expect(getHostShadowRoot(elm).querySelector('div')).toBeNull();
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
            const ul = getHostShadowRoot(elm).querySelector('ul');
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
        expect(getHostShadowRoot(elm).querySelector('membrane-parent-query-selector-child-custom-element-child').querySelector('div')).toBe(null);
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
            const ul = getHostShadowRoot(elm).querySelectorAll('ul')[0];
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
            const ul = getHostShadowRoot(elm).querySelector('ul');
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
                getHostShadowRoot(elm).querySelector('doesnotexist');
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
            expect(getHostShadowRoot(elm).querySelector('doesnotexist')).toBeNull();
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
                getHostShadowRoot(elm).querySelectorAll('doesnotexist');
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
            getHostShadowRoot(
                getHostShadowRoot(elm).querySelector('x-child-parent-shadow-root')
            ).querySelector('div').click();
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
            const root = getHostShadowRoot(elm);
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
            const root = getHostShadowRoot(elm);
            expect(root.querySelector('div').parentElement).toBe(root);
        });
    });
});


describe.only('#childNodes', () => {
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
        const slot = getHostShadowRoot(
            getHostShadowRoot(elm).querySelector('x-child-node-with-slot')
        ).querySelector('slot');
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
        const slot = getHostShadowRoot(
            getHostShadowRoot(elm).querySelector('x-child-node-with-slot')
        ).querySelector('slot');
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
        const child = getHostShadowRoot(elm).querySelector('div');
        const childNodes = child.childNodes;
        expect(childNodes).toHaveLength(1);
        expect(childNodes[0]).toBe(getHostShadowRoot(elm).querySelector('p'));
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
        const child = getHostShadowRoot(elm).querySelector('x-child');
        const childNodes = child.childNodes;
        expect(childNodes).toHaveLength(0);
    });

    it.only('should return correct elements for custom elements when children present', () => {
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
        const child = getHostShadowRoot(elm).querySelector('x-child');
        const childNodes = child.childNodes;
        expect(childNodes).toHaveLength(1);
    });

    it('should return child text content passed via slot', () => {
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
                                $api.t('text')
                            ]),
                        ]),
                    ];
                }
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const child = getHostShadowRoot(elm).querySelector('x-child');
        const childNodes = child.childNodes;
        expect(childNodes).toHaveLength(1);
        expect(childNodes[0].nodeType).toBe(3);
        expect(childNodes[0].textContent).toBe('text');
    });

    it('should not return child text from within template', () => {
        function tmpl($api, $cmp, $slotset) {
            return [
                $api.t('text'),
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
        const child = getHostShadowRoot(elm).querySelector('x-child');
        const childNodes = child.childNodes;
        expect(childNodes).toHaveLength(0);
    });

    it('should not return dynamic child text from within template', () => {
        function tmpl($api, $cmp, $slotset) {
            return [
                $api.d($cmp.dynamicText),
            ]
        }

        class Parent extends Element {
            get dynamicText() {
                return 'text';
            }

            render() {
                return tmpl;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const childNodes = getHostChildNodes(elm);
        expect(childNodes).toHaveLength(0);
    });

    it('should return correct childNodes from shadowRoot', () => {
        class Parent extends Element {
            render() {
                return function ($api) {
                    return [
                        $api.h('div', {
                            key: 0,
                        }, []),
                        $api.t('text'),
                    ];
                }
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const childNodes = getHostShadowRoot(elm).childNodes;
        expect(childNodes).toHaveLength(2);
        expect(childNodes[0]).toBe(getHostShadowRoot(elm).querySelector('div'));
        expect(childNodes[1].nodeType).toBe(3);
        expect(childNodes[1].textContent).toBe('text');
    });
});


describe('assignedSlot', () => {
    it('should return null when custom element is not in slot', () => {
        class NoSlot extends Element {}

        function html($api) {
            return [
                $api.c('x-assigned-slot-child', NoSlot, {}, []),
            ];
        }

        class MyComponent extends Element {
            render() {
                return html;
            }
        }

        const elm = createElement('x-assigned-slot', { is: MyComponent });
        document.body.appendChild(elm);
        const child = getHostShadowRoot(elm).querySelector('x-assigned-slot-child');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return null when native element is not in slot', () => {
        function html($api) {
            return [
                $api.h('div', {
                    key: 0,
                }, []),
            ];
        }

        class MyComponent extends Element {
            render() {
                return html;
            }
        }

        const elm = createElement('x-assigned-slot', { is: MyComponent });
        document.body.appendChild(elm);
        const child = getHostShadowRoot(elm).querySelector('div');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return correct slot when native element is slotted', () => {
        function slottedHtml($api, $cmp, $slotset) {
            return [
                $api.s('', {
                    key: 1,
                }, [], $slotset),
            ];
        }

        slottedHtml.slots = [""];

        class WithSlot extends Element {
            render() {
                return slottedHtml;
            }
        }

        function html($api) {
            return [
                $api.c('x-native-slotted-component-child', WithSlot, {
                    key: 0,
                }, [
                    $api.h('div', {
                        key: 2,
                    }, [
                        $api.t('test')
                    ])
                ]),
            ];
        }

        class MyComponent extends Element {
            render() {
                return html;
            }
        }

        const elm = createElement('x-native-slotted-component', { is: MyComponent });
        document.body.appendChild(elm);
        const slot = getHostShadowRoot(
            getHostShadowRoot(elm).querySelector('x-native-slotted-component-child')
        ).querySelector('slot');
        const child = getHostShadowRoot(elm).querySelector('div');
        expect(child.assignedSlot).toBe(slot);
    });

    it('should return correct slot when custom element is slotted', () => {
        class InsideSlot extends Element {}

        function slottedHtml($api, $cmp, $slotset) {
            return [
                $api.s('', {
                    key: 1,
                }, [], $slotset),
            ];
        }

        slottedHtml.slots = [""];

        class WithSlot extends Element {
            render() {
                return slottedHtml;
            }
        }

        function html($api) {
            return [
                $api.c('x-native-slotted-component-child', WithSlot, {
                    key: 0,
                }, [
                    $api.c('x-inside-slot', InsideSlot, {
                        key: 2,
                    }, [])
                ]),
            ];
        }

        class MyComponent extends Element {
            render() {
                return html;
            }
        }

        const elm = createElement('x-native-slotted-component', { is: MyComponent });
        document.body.appendChild(elm);
        const slot = getHostShadowRoot(
            getHostShadowRoot(elm).querySelector('x-native-slotted-component-child')
        ).querySelector('slot');
        const child = getHostShadowRoot(elm).querySelector('x-inside-slot');
        expect(child.assignedSlot).toBe(slot);
    });

    it('should return null when native element default slot content', () => {
        function html($api) {
            return [
                $api.s('', {
                    key: 0,
                }, [
                    $api.h('div', {
                        key: 1,
                    }, []),
                ]),
            ];
        }

        class MyComponent extends Element {
            render() {
                return html;
            }
        }

        const elm = createElement('x-assigned-slot', { is: MyComponent });
        document.body.appendChild(elm);
        const child = getHostShadowRoot(elm).querySelector('div');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return null when custom element default slot content', () => {
        class CustomElement extends Element {

        }

        function html($api) {
            return [
                $api.s('', {
                    key: 0,
                }, [
                    $api.c('x-default-slot-custom-element', CustomElement, {
                        key: 1,
                    }, []),
                ]),
            ];
        }

        class MyComponent extends Element {
            render() {
                return html;
            }
        }

        const elm = createElement('x-assigned-slot', { is: MyComponent });
        document.body.appendChild(elm);
        const child = getHostShadowRoot(elm).querySelector('x-default-slot-custom-element');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return correct slot when text is slotted', () => {
        class InsideSlot extends Element {}

        function slottedHtml($api, $cmp, $slotset) {
            return [
                $api.s('', {
                    key: 1,
                }, [], $slotset),
            ];
        }

        slottedHtml.slots = [""];

        class WithSlot extends Element {
            render() {
                return slottedHtml;
            }
        }

        function html($api) {
            return [
                $api.c('x-native-slotted-component-child', WithSlot, {
                    key: 0,
                }, [
                    $api.t('text')
                ]),
            ];
        }

        class MyComponent extends Element {
            render() {
                return html;
            }
        }

        const elm = createElement('x-native-slotted-component', { is: MyComponent });
        document.body.appendChild(elm);
        const slot = getHostShadowRoot(
            getHostShadowRoot(elm).querySelector('x-native-slotted-component-child')
        ).querySelector('slot');
        const text = getHostShadowRoot(elm).querySelector('x-native-slotted-component-child').childNodes[0];
        expect(text.assignedSlot).toBe(slot);
    });
});
