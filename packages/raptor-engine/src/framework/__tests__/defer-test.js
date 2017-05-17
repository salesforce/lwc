import * as api from "../api";
import { patch } from '../patch';
import { Element } from "../html-element";
import assert from 'power-assert';

export function createComponentMock() {
    const cmpMock = {
        toString: () => '[object:component Mock]'
    };
    return cmpMock;
}

export function createVmMock() {
    const vmMock = {
        component: createComponentMock(),
        context: {},
        toString: () => '[object:vm Mock]'
    };
    return vmMock;
}

describe('defer', () => {

    describe('integration', () => {

        it('should support a promise that resolves to undefined from render()', () => {
            let counter = 0;
            const elm = document.createElement('x-foo');
            const p = Promise.resolve(undefined);
            class MyComponent extends Element {
                render() {
                    counter++;
                    return p;
                }
            }
            const vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode); // insert `x-foo`
            return Promise.resolve().then(() => {
                assert.strictEqual(counter, 1);
            });
        });

        it('should support rendering to a promise that resolves to a function that returns undefined', () => {
            let renderCounter = 0;
            let fnCounter = 0;
            const elm = document.createElement('x-foo');
            const p = Promise.resolve(() => {
                fnCounter++;
                return undefined;
            });
            class MyComponent extends Element {
                render() {
                    renderCounter++;
                    return p;
                }
            }
            const vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode); // insert `x-foo`
            return Promise.resolve().then(() => {
                assert.strictEqual(renderCounter, 2);
                assert.strictEqual(fnCounter, 1);
            });
        });

        it('should support rendering to a promise that resolves to a template', () => {
            let renderCounter = 0;
            let fnCounter = 0;
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            function template() {
                fnCounter++;
                return [api.h('p', {}, [])];
            }
            const p = Promise.resolve(template);
            class MyComponent extends Element {
                render() {
                    renderCounter++;
                    return p;
                }
            }
            const vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode); // insert `x-foo`
            return p.then(() => {
                assert.strictEqual(renderCounter, 2);
                assert.strictEqual(fnCounter, 1);
                assert.strictEqual(1, elm.querySelectorAll('p').length);
            });
        });

    });

});
