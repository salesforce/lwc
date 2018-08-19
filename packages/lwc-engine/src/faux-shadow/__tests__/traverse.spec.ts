import { createElement, LightningElement } from '../../framework/main';
import { getHostShadowRoot } from "../../framework/html-element";
import { compileTemplate } from 'test-utils';

describe('#LightDom querySelectorAll()', () => {
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

            class Parent extends LightningElement {
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

            class LightdomQuerySelector extends LightningElement {
                render() {
                    return tmpl$2;
                }

            }

            const element = createElement('lightdom-queryselector', { is: LightdomQuerySelector });
            document.body.appendChild(element);
            const nested = getHostShadowRoot(element).querySelector('x-parent').querySelectorAll('div');
            expect(nested).toHaveLength(2);
            expect(nested[0]).toBe(getHostShadowRoot(element).querySelector('.first'));
            expect(nested[1]).toBe(getHostShadowRoot(element).querySelector('.second'));
        });

        it('should ignore elements from template', () => {
            function html1($api) {
                return [$api.h('p', { key: 0 }, [])];
            }
            class Child extends LightningElement {
                render() {
                    return html1;
                }
            }
            function html2($api) {
                return [$api.c('x-child', Child, { key: 0 }, [])];
            }
            class Parent extends LightningElement {
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
            const def = class MyComponent extends LightningElement {
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

            class Parent extends LightningElement {
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

            class LightdomQuerySelector extends LightningElement {
                render() {
                    return tmpl$2;
                }
            }

            const element = createElement('lightdom-queryselector', { is: LightdomQuerySelector });
            document.body.appendChild(element);
            const nested = getHostShadowRoot(element).querySelector('x-parent').querySelectorAll('div');
            expect(nested).toHaveLength(2);
            expect(nested[0]).toBe(getHostShadowRoot(element).querySelector('.first'));
            expect(nested[1]).toBe(getHostShadowRoot(element).querySelector('.second'));
        });
    });
});

describe('#LightDom querySelector()', () => {
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

        class Parent extends LightningElement {
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

        class LightdomQuerySelector extends LightningElement {
            render() {
                return tmpl$2;
            }
        }

        const element = createElement('lightdom-queryselector', { is: LightdomQuerySelector });
        document.body.appendChild(element);
        const div = getHostShadowRoot(element).querySelector('x-parent').querySelector('div');
        expect(div).toBe(getHostShadowRoot(element).querySelector('.first'));
    });

    it('should ignore element from template', () => {
        function html1($api) {
            return [$api.h('p', { key: 0 }, [])];
        }
        class Child extends LightningElement {
            render() {
                return html1;
            }
        }
        function html2($api) {
            return [$api.c('x-child', Child, { key: 0 }, [])];
        }
        class Parent extends LightningElement {
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
        const def = class MyComponent extends LightningElement {
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
        const def = class MyComponent extends LightningElement {
            render() {
                return html;
            }
        };
        const elm = createElement('x-foo', { is: def });
        document.body.appendChild(elm);
        expect(getHostShadowRoot(elm).querySelector('div')).toBeNull();
    });
});

describe('#shadowRoot querySelector', () => {
    it('should querySelector on element from template', () => {
        function html($api) { return [$api.h('ul', { key: 0 }, [$api.h('li', { key: 1 }, [])])]; }
        class MyComponent extends LightningElement {
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
        class MyChild extends LightningElement {
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

        class MyComponent extends LightningElement {
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
        class MyComponent extends LightningElement {
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

    it('should adopt elements not defined in template as part of the shadow', () => {
        function html($api) { return [$api.h('ul', { key: 0 }, [])]; }
        class MyComponent extends LightningElement {
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
            expect(li1).toBeDefined();
            const li2 = ul.querySelector('li');
            expect(li2).toBe(li1);
            const li3 = ul.childNodes[0];
            expect(li3).toBe(li1);
        });
    });

    it('should not throw error if querySelector does not match any elements', () => {
        function html($api) { return [$api.h('ul', { key: 0 }, [])]; }
        class MyComponent extends LightningElement {
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
        class MyComponent extends LightningElement {
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
        class MyComponent extends LightningElement {
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
        class MyChild extends LightningElement {
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

        class MyComponent extends LightningElement {
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
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            const root = getHostShadowRoot(elm);
            expect(root.querySelector('div').parentNode).toBe(root);
        });
    });

    it('should not allow walking back to the shadow root via parentElement', () => {
        function html($api) {
            return [$api.h('div', { key: 0 }, [])];
        }
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            const root = getHostShadowRoot(elm);
            expect(root.querySelector('div').parentElement).toBe(null);
        });
    });
});

describe('proxy', () => {
    it('should allow setting properties manually', () => {
        function html($api) {
            return [$api.h('div', { key: 0 }, [])];
        }
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const root = getHostShadowRoot(elm);
        root.querySelector('div').id = 'something';
        expect(root.querySelector('div').getAttribute('id')).toBe('something');
    });
    it('should allow setting innerHTML manually', () => {
        function html($api) {
            return [$api.h('span', { key: 0 }, [])];
        }
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
            renderedCallback() {
                this.template.querySelector('span').innerHTML = '<i>something</i>';
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const root = getHostShadowRoot(elm);
        expect(root.querySelector('span').textContent).toBe('something');
    });
    it('should unwrap arguments when invoking a method on a proxy', () => {
        function html($api) {
            return [$api.h('div', { key: 0 }, [$api.h('p', { key: 1 }, [])])];
        }
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const root = getHostShadowRoot(elm);
        const div = root.querySelector('div');
        const p = root.querySelector('p');
        expect(div.contains(p)).toBe(true);
    });
    it('should allow setting attributes manually', () => {
        function html($api) {
            return [$api.h('div', { key: 0 }, [])];
        }
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const root = getHostShadowRoot(elm);
        root.querySelector('div').setAttribute('id', 'something');
        expect(root.querySelector('div').id).toBe('something');
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

        class HasSlot extends LightningElement {
            render() {
                return tmpl;
            }
        }

        class Parent extends LightningElement {
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

        class HasSlot extends LightningElement {
            render() {
                return tmpl;
            }
        }

        class Parent extends LightningElement {
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
        class Parent extends LightningElement {
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

    it('should log a warning when accessing childNodes property', () => {
        const html = compileTemplate(`<template><div><p></p></div></template>`);
        class Parent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);

        expect(() => {
            const childNodes = getHostShadowRoot(elm).childNodes;
        }).toLogWarning(`Discouraged access to property 'childNodes' on 'Node': It returns a live NodeList and should not be relied upon. Instead, use 'querySelectorAll' which returns a static NodeList.`);

        expect(() => {
            const child = getHostShadowRoot(elm).querySelector('div');
            const childNodes = child.childNodes;
        }).toLogWarning(`childNodes on [object HTMLDivElement] returns a live NodeList which is not stable. Use querySelectorAll instead.`);
    });

    it('should return correct elements for custom elements when no children present', () => {
        function tmpl($api) {
            return [
                $api.h('div', {
                    key: 3,
                }, []),
            ]
        }
        class Child extends LightningElement {
            render() {
                return tmpl;
            }
        }

        class Parent extends LightningElement {
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

    it('should return correct elements for custom elements when children present', () => {
        function tmpl($api, $cmp, $slotset) {
            return [
                $api.s('', {
                    key: 3,
                }, [], $slotset),
            ]
        }
        class Child extends LightningElement {
            render() {
                return tmpl;
            }
        }

        class Parent extends LightningElement {
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
        class Child extends LightningElement {
            render() {
                return tmpl;
            }
        }

        class Parent extends LightningElement {
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
        class Child extends LightningElement {
            render() {
                return tmpl;
            }
        }

        class Parent extends LightningElement {
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
            ];
        }

        class Child extends LightningElement {
            get dynamicText() {
                return 'text';
            }
            render() {
                return tmpl;
            }
        }

        function tmplParent($api, $cmp, $slotset) {
            return [
                $api.c('x-child', Child, {}, []),
            ];
        }
        class Parent extends LightningElement {

            render() {
                return tmplParent;
            }
        }

        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        const childNodes = getHostShadowRoot(elm).querySelector('x-child').childNodes;
        expect(childNodes).toHaveLength(0);
    });

    it('should return correct childNodes from shadowRoot', () => {
        class Parent extends LightningElement {
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
        class NoSlot extends LightningElement {}

        function html($api) {
            return [
                $api.c('x-assigned-slot-child', NoSlot, {}, []),
            ];
        }

        class MyComponent extends LightningElement {
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

        class MyComponent extends LightningElement {
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

        class WithSlot extends LightningElement {
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

        class MyComponent extends LightningElement {
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
        class InsideSlot extends LightningElement {}

        function slottedHtml($api, $cmp, $slotset) {
            return [
                $api.s('', {
                    key: 1,
                }, [], $slotset),
            ];
        }

        slottedHtml.slots = [""];

        class WithSlot extends LightningElement {
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

        class MyComponent extends LightningElement {
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

        class MyComponent extends LightningElement {
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
        class CustomElement extends LightningElement {

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

        class MyComponent extends LightningElement {
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
        class InsideSlot extends LightningElement {}

        function slottedHtml($api, $cmp, $slotset) {
            return [
                $api.s('', {
                    key: 1,
                }, [], $slotset),
            ];
        }

        slottedHtml.slots = [""];

        class WithSlot extends LightningElement {
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

        class MyComponent extends LightningElement {
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
