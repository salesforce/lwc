import { h, c, t, RenderAPI } from "../../api";
import { Element } from "../../html-element";
import { VNode } from "../../../3rdparty/snabbdom/types";
import { createElement } from "../../upgrade";
import { Component } from "../../component";

describe('module/events', () => {

    it('attaches click event handler to element', function() {
        let result: Event[] = [], cmp: Component;
        class MyComponent extends Element {
            constructor() {
                super();
                cmp = this;
            }
            render() {
                return function($api: RenderAPI) {
                    return [
                        $api.h('div', {on: {click(ev: Event) { result.push(ev); }}}, [
                            $api.h('a', {}, [t('Click my parent')]),
                        ])
                    ];
                };
            }
        }
        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        cmp.root.querySelector('div').click();
        expect(result).toHaveLength(1);
    });

    it('does not attach new listener', function() {
        let result: Number[] = [], component: Component, second = false;
        class MyComponent extends Element {
            constructor() {
                super();
                component = this;
                this.counter = 0;
            }
            render() {
                const c = this.counter;
                return function($api: RenderAPI, $cmp: Component) {
                    // using the same key
                    if (c === 0) {
                        return [
                            $api.h('div', {key: 1, on: {click: $api.b($cmp.clickOne)}}, [
                                $api.h('a', {}, [t('Click my parent')]),
                            ])
                        ];
                    } else if (c === 1) {
                        second = true;
                        return [
                            $api.h('div', {key: 1, on:  {click: $api.b($cmp.clickTwo)}}, [
                                $api.h('a', {}, [t('Click my parent')]),
                            ])
                        ];
                    }
                };
            }
            clickOne(ev: Event) { result.push(1); }
            clickTwo(ev: Event) { result.push(2); }
        }
        MyComponent.track = { counter: 1 };
        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        component.root.querySelector('div').click();
        component.counter += 1;
        return Promise.resolve().then( () => {
            component.root.querySelector('div').click();
            expect(second).toBe(true);
            expect(result).toEqual([1, 2]);
        });
    });

    it('should reuse the listener', function() {
        let result: Number[] = [], component: Component, second = false;
        class MyComponent extends Element {
            constructor() {
                super();
                component = this;
                this.counter = 0;
            }
            render() {
                const c = this.counter;
                return function($api: RenderAPI, $cmp: Component) {
                    // using different keys
                    if (c === 0) {
                        return [
                            $api.h('p', {key: 1, on: {click: $api.b($cmp.clicked)}}, [
                                $api.h('a', {}, [t('Click my parent')]),
                            ])
                        ];
                    } else if (c === 1) {
                        second = true;
                        return [
                            $api.h('div', {key: 2, on:  {click: $api.b($cmp.clicked)}}, [
                                $api.h('a', {}, [t('Click my parent')]),
                            ])
                        ];
                    }
                };
            }
            clicked(ev: Event) { result.push(1); }
        }
        MyComponent.track = { counter: 1 };
        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        component.root.querySelector('p').click();
        component.counter += 1;
        return Promise.resolve().then( () => {
            expect(second).toBe(true);
            component.root.querySelector('div').click();
            expect(result).toEqual([1, 1]);
        });
    });

    it('must not expose the virtual node to the event handler', function() {
        let result: any[] = [], cmp: Component;
        class MyComponent extends Element {
            constructor() {
                super();
                cmp = this;
            }
            render() {
                return function($api: RenderAPI, $cmp: Component) {
                    return [
                        $api.h('div', {on: {click: $api.b($cmp.clicked)}}, [
                            $api.h('a', {}, [t('Click my parent')]),
                        ])
                    ];
                };
            }
            clicked() {
                result.push(this);
                result.push.apply(result, arguments);
            }
        }
        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        cmp.root.querySelector('div').click();
        expect(result).toHaveLength(2);
        expect(result[0]).toBe(cmp);
        expect(result[1]).toBeInstanceOf(Event);
    });

    it('attaches click event handler to custom element', function() {
        let result: Event[] = [], cmp: Component;
        class MyChild extends Element {}
        class MyComponent extends Element {
            constructor() {
                super();
                cmp = this;
            }
            render() {
                return function($api: RenderAPI) {
                    return [
                        $api.c('x-child', MyChild, {on: {click(ev: Event) { result.push(ev); }}})
                    ];
                };
            }
        }
        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        cmp.root.querySelector('x-child').click();
        expect(result).toHaveLength(1);
    });

    it('attaches custom event handler to custom element', function() {
        let result: Event[] = [], cmp: Component;
        class MyChild extends Element {}
        class MyComponent extends Element {
            constructor() {
                super();
                cmp = this;
            }
            render() {
                return function($api: RenderAPI) {
                    return [
                        $api.c('x-child', MyChild, {on: {test(ev: Event) { result.push(ev); }}})
                    ];
                };
            }
        }
        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        cmp.root.querySelector('x-child').dispatchEvent(new CustomEvent('test', {}));
        expect(result).toHaveLength(1);
    });

});
