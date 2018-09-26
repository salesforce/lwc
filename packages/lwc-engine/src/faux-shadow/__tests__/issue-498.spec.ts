import { createElement, LightningElement } from '../../framework/main';
import { getHostShadowRoot } from '../../framework/html-element';

describe('issue #498', () => {

    it('should allow access to element constructor prototype', () => {
        class Custom extends LightningElement {
            render() {
                return function ($api) {
                    return [
                        $api.h('div', { key: 0 }, []),
                    ];
                }
            }
        }
        const elm = createElement('x-foo', { is: Custom });
        document.body.appendChild(elm);
        expect(() => {
            getHostShadowRoot(elm).querySelector('div').constructor.prototype;
        }).not.toThrow();
    });

    it('should allow access to non-configurable property', () => {
        class Custom extends LightningElement {
            render() {
                return function ($api) {
                    return [
                        $api.h('div', { key: 0 }, []),
                    ];
                }
            }
        }
        const elm = createElement('x-foo', { is: Custom });
        document.body.appendChild(elm);
        const div = getHostShadowRoot(elm).querySelector('div');
        Object.defineProperty(div, 'foo', {
            value: function () {},
            configurable: false,
        });
        expect(() => {
            div.foo;
        }).not.toThrow();
    });

    it('should allow access to non-writable property', () => {
        class Custom extends LightningElement {
            render() {
                return function ($api) {
                    return [
                        $api.h('div', { key: 0 }, []),
                    ];
                }
            }
        }
        const elm = createElement('x-foo', { is: Custom });
        document.body.appendChild(elm);
        const div = getHostShadowRoot(elm).querySelector('div');
        Object.defineProperty(div, 'foo', {
            value: function () {},
            configurable: true,
            writable: false,
        });
        expect(() => {
            div.foo;
        }).not.toThrow();
    });

    it('should not throw when property is not defined on object', () => {
        class Custom extends LightningElement {
            render() {
                return function ($api) {
                    return [
                        $api.h('div', { key: 0 }, []),
                    ];
                }
            }
        }
        const elm = createElement('x-foo', { is: Custom });
        document.body.appendChild(elm);
        const div = getHostShadowRoot(elm).querySelector('div');
        expect(() => {
            div.foo;
        }).not.toThrow();
    });

    it('should not throw when property is defined on prototype', () => {
        class Custom extends LightningElement {
            render() {
                return function ($api) {
                    return [
                        $api.h('div', { key: 0 }, []),
                    ];
                }
            }
        }
        const elm = createElement('x-foo', { is: Custom });
        document.body.appendChild(elm);
        const div = getHostShadowRoot(elm).querySelector('div');
        Object.setPrototypeOf(div, { foo: {} })
        expect(() => {
            div.foo;
        }).not.toThrow();
    });

});
