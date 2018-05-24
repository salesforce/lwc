import { Element } from "../html-element";
import { createElement } from "../upgrade";
import assertLogger from '../assert';
import { register } from "../services";
import { ViewModelReflection } from "../def";
import { VNode } from "../../3rdparty/snabbdom/types";
import { Component } from "../component";
import { unwrap } from "../main";
import { querySelector } from "../dom";

describe('#lightDomQuerySelectorAll()', () => {
    describe('Invoked from within component', () => {
        it('should allow searching for passed elements', () => {
            function tmpl$1($api, $cmp, $slotset, $ctx) {
                const {
                    "$default$": slot0
                } = $slotset;

                return slot0 || [];
            }
            tmpl$1.slots = ["$default$"];

            class Parent extends Element {
                selectAllDivs() {
                    return this.querySelectorAll('div');
                }

                render() {
                    return tmpl$1;
                }

            }
            Parent.publicMethods = ["selectAllDivs"];

            function tmpl$2($api, $cmp, $slotset, $ctx) {
                const {
                    t: api_text,
                    h: api_element,
                    c: api_custom_element
                    } = $api;

                    return [api_custom_element("x-parent", Parent, {
                        key: 1,
                        "slotset": {
                            "$default$": [api_element("div", {
                                key: 2
                            }, [api_text("First")]), api_element("div", {
                                key: 3
                            }, [api_text("Second")])]
                        }
                    })];
            }

            class LightdomQuerySelector extends Element {
                render() {
                    return tmpl$2;
                }

            }

            const element = createElement('lightdom-queryselector', { is: LightdomQuerySelector });
            document.body.appendChild(element);
            const nested = querySelector.call(element, 'x-parent').selectAllDivs();
            expect(nested.length).toBe(2);
            expect(nested[0]).toBe(querySelector.call(element, 'x-parent div:nth-child(1)'));
            expect(nested[1]).toBe(querySelector.call(element, 'x-parent div:nth-child(2)'));
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
            function html($api) {
                return [$api.h('p', { key: 0 }, [])];
            }
            const def = class MyComponent extends Element {
                render() {
                    return html;
                }
            };
            const elm = createElement('x-should-ignore-elements-from-template', { is: def });
            document.body.appendChild(elm);
            expect(elm[ViewModelReflection].component.querySelectorAll('p')).toHaveLength(0);
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
                elm[ViewModelReflection].component.querySelectorAll('div');
            }).not.toThrow();
        });
    });

    describe('Invoked from element instance', () => {
        it('should allow searching for passed elements', () => {
            function tmpl$1($api, $cmp, $slotset, $ctx) {
                const {
                    "$default$": slot0
                } = $slotset;

                return slot0 || [];
            }
            tmpl$1.slots = ["$default$"];

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

                    return [api_custom_element("x-parent", Parent, {
                        key: 1,
                        "slotset": {
                            "$default$": [api_element("div", {
                                key: 2
                            }, [api_text("First")]), api_element("div", {
                                key: 3
                            }, [api_text("Second")])]
                        }
                    })];
            }

            class LightdomQuerySelector extends Element {
                selectDivs() {
                    return this.template.querySelector('x-parent').querySelectorAll('div');
                }

                render() {
                    return tmpl$2;
                }
            }
            LightdomQuerySelector.publicMethods = ['selectDivs'];

            const element = createElement('lightdom-queryselector', { is: LightdomQuerySelector });
            document.body.appendChild(element);
            const nested = element.selectDivs();
            expect(nested.length).toBe(2);
            expect(nested[0]).toBe(querySelector.call(element, 'x-parent div:nth-child(1)'));
            expect(nested[1]).toBe(querySelector.call(element, 'x-parent div:nth-child(2)'));
        });
    });
});

describe('#lightDomQuerySelector()', () => {
    it('should allow searching for the passed element', () => {
        function tmpl$1($api, $cmp, $slotset, $ctx) {
            const {
                "$default$": slot0
            } = $slotset;

            return slot0 || [];
        }
        tmpl$1.slots = ["$default$"];

        class Parent extends Element {
            selectFirstDiv() {
                return this.querySelector('div');
            }

            render() {
                return tmpl$1;
            }

        }
        Parent.publicMethods = ["selectFirstDiv"];

        function tmpl$2($api, $cmp, $slotset, $ctx) {
            const {
                t: api_text,
                h: api_element,
                c: api_custom_element
            } = $api;

            return [api_custom_element("x-parent", Parent, {
                key: 1,
                "slotset": {
                    "$default$": [api_element("div", {
                        key: 2
                    }, [api_text("First")]), api_element("div", {
                        key: 3
                    }, [api_text("Second")])]
                }
            })];
        }

        class LightdomQuerySelector extends Element {
            render() {
                return tmpl$2;
            }
        }

        const element = createElement('lightdom-queryselector', { is: LightdomQuerySelector });
        document.body.appendChild(element);
        const div = querySelector.call(element, 'x-parent').selectFirstDiv();
        expect(div).toBe(querySelector.call(element, 'x-parent div'));
    });

    it('should ignore element from template', () => {
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
        expect(elm[ViewModelReflection].component.querySelector('p')).toBeNull();
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
            elm[ViewModelReflection].component.querySelector('div');
        }).not.toThrow();
    });

    it('should return null if element does not exist', function() {
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
        expect(elm[ViewModelReflection].component.querySelector('div')).toBeNull();
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
            const ul = (elm[ViewModelReflection].component as Component).template.querySelector('ul');
            expect(ul);
            const li = ul.querySelector('li');
            expect(li);
        });
    });

    it('should not reach into child components template when querySelector invoked on child custom element', () => {
        expect.assertions(1);
        let childTemplate;
        class MyChild extends Element {
            render() {
                return function ($api) {
                    return [$api.h('div', {
                        key: 0,
                    }, [])];
                }
            }
        }

        function html($api, $cmp) {
            return [$api.c('membrane-parent-query-selector-child-custom-element-child', MyChild, {})];
        }

        class MyComponent extends Element {
            queryChild() {
                return this.template.querySelector('membrane-parent-query-selector-child-custom-element-child').querySelector('div');
            }

            render() {
                return html;
            }
        }

        MyComponent.publicMethods = ['queryChild'];

        const elm = createElement('membrane-parent-query-selector-child-custom-element', { is: MyComponent });
        document.body.appendChild(elm);
        expect(elm.queryChild()).toBe(null);
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
            const ul = (elm[ViewModelReflection].component as Component).template.querySelectorAll('ul')[0];
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
            const ul = (elm[ViewModelReflection].component as Component).template.querySelector('ul');
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
                (elm[ViewModelReflection].component as Component).template.querySelector('doesnotexist');
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
            expect((elm[ViewModelReflection].component as Component).template.querySelector('doesnotexist')).toBeNull();
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
                (elm[ViewModelReflection].component as Component).template.querySelectorAll('doesnotexist');
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

            clickDiv() {
                this.template.querySelector('div').click();
            }

            render() {
                return function ($api) {
                    return [$api.h('div', {
                        key: 0,
                    }, [])];
                }
            }
        }

        MyChild.publicMethods = ['clickDiv'];

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

            clickChildDiv() {
                this.template.querySelector('x-child-parent-shadow-root').clickDiv();
            }

            render() {
                return html;
            }
        }

        MyComponent.publicMethods = ['clickChildDiv'];

        const elm = createElement('membrane-child-parent-shadow-root-parent', { is: MyComponent });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            elm.clickChildDiv();
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
            const root = (elm[ViewModelReflection].component as Component).template;
            expect(root.querySelector('div').parentNode).toBe(root);
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
            const root = (elm[ViewModelReflection].component as Component).template;
            expect(root.querySelector('div').parentElement).toBe(root);
        });
    });
});
