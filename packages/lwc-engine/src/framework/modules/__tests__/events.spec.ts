import { createElement, Element } from '../../main';

describe('module/events', () => {
    it('attaches click event handler to element', function() {
        let result: Event[] = [], cmp;
        function html($api) {
            return [
                $api.h('div', {key: 1, on: {click(ev: Event) { result.push(ev); }}}, [
                    $api.h('a', { key: 0 }, [$api.t('Click my parent')]),
                ])
            ];
        }
        class MyComponent extends Element {
            constructor() {
                super();
                cmp = this;
            }
            render() {
                return html;
            }
        }
        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        cmp.template.querySelector('div').click();
        expect(result).toHaveLength(1);
    });

    it('does not attach new listener', function() {
        let result: Number[] = [], component, second = false;
        function html($api, $cmp) {
            const c = $cmp.counter;
            // using the same key
            if (c === 0) {
                return [
                    $api.h('div', {key: 1, on: {click: $api.b($cmp.clickOne)}}, [
                        $api.h('a', {key: 0}, [$api.t('Click my parent')]),
                    ])
                ];
            } else if (c === 1) {
                second = true;
                return [
                    $api.h('div', {key: 1, on:  {click: $api.b($cmp.clickTwo)}}, [
                        $api.h('a', {key: 0}, [$api.t('Click my parent')]),
                    ])
                ];
            }
        }
        class MyComponent extends Element {
            constructor() {
                super();
                component = this;
                this.counter = 0;
            }
            render() {
                return html;
            }
            clickOne(ev: Event) { result.push(1); }
            clickTwo(ev: Event) { result.push(2); }
        }
        MyComponent.track = { counter: 1 };
        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        component.template.querySelector('div').click();
        component.counter += 1;
        return Promise.resolve().then( () => {
            component.template.querySelector('div').click();
            expect(second).toBe(true);
            expect(result).toEqual([1, 2]);
        });
    });

    it('should reuse the listener', function() {
        let result: Number[] = [], component, second = false;
        function html($api, $cmp) {
            const c = $cmp.counter;
            // using different keys
            if (c === 0) {
                return [
                    $api.h('p', { key: 1, on: {click: $api.b($cmp.clicked)}}, [
                        $api.h('a', { key: 0 }, [$api.t('Click my parent')]),
                    ])
                ];
            } else if (c === 1) {
                second = true;
                return [
                    $api.h('div', { key: 2, on:  {click: $api.b($cmp.clicked)}}, [
                        $api.h('a', { key: 3 }, [$api.t('Click my parent')]),
                    ])
                ];
            }
        }
        class MyComponent extends Element {
            constructor() {
                super();
                component = this;
                this.counter = 0;
            }
            render() {
                return html;
            }
            clicked(ev: Event) { result.push(1); }
        }
        MyComponent.track = { counter: 1 };
        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        component.template.querySelector('p').click();
        component.counter += 1;
        return Promise.resolve().then( () => {
            expect(second).toBe(true);
            component.template.querySelector('div').click();
            expect(result).toEqual([1, 1]);
        });
    });

    it('must not expose the virtual node to the event handler', function() {
        let result: any[] = [], cmp;
        function html($api, $cmp) {
            return [
                $api.h('div', {key: 0, on: {click: $api.b($cmp.clicked)}}, [
                    $api.h('a', {key: 1}, [$api.t('Click my parent')]),
                ])
            ];
        }
        class MyComponent extends Element {
            constructor() {
                super();
                cmp = this;
            }
            render() {
                return html;
            }
            clicked() {
                result.push(this);
                result.push.apply(result, arguments);
            }
        }
        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        cmp.template.querySelector('div').click();
        expect(result).toHaveLength(2);
        expect(result[0]).toBe(cmp);
        expect(result[1]).toBeInstanceOf(Event);
    });

    it('attaches click event handler to custom element', function() {
        let result: Event[] = [], cmp;
        class MyChild extends Element {}
        function html($api) {
            return [
                $api.c('x-child', MyChild, {on: {click(ev: Event) { result.push(ev); }}})
            ];
        }
        class MyComponent extends Element {
            constructor() {
                super();
                cmp = this;
            }
            render() {
                return html;
            }
        }
        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        cmp.template.querySelector('x-child').click();
        expect(result).toHaveLength(1);
    });

    it('attaches custom event handler to custom element', function() {
        let result: Event[] = [], cmp;
        class MyChild extends Element {}
        function html($api) {
            return [
                $api.c('x-child', MyChild, {on: {test(ev: Event) { result.push(ev); }}})
            ];
        }
        class MyComponent extends Element {
            constructor() {
                super();
                cmp = this;
            }
            render() {
                return html;
            }
        }
        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        cmp.template.querySelector('x-child').dispatchEvent(new CustomEvent('test', {}));
        expect(result).toHaveLength(1);
    });

});
