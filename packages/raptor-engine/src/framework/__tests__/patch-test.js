import * as target from '../patch';
import * as api from "../api";
import { Element } from "../html-element";
import assert from 'power-assert';

describe('patch', () => {

    describe('#patch()', () => {

        it('should call connectedCallback asyncronously', () => {
            let flag = false;
            const def = class MyComponent extends Element {
                connectedCallback() {
                    flag = true;
                }
            }
            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', def, {});
            target.patch(elm, vnode);
            assert(flag === false, 'connectedCallback should not run syncronously');
            return Promise.resolve().then(() => {
                assert(flag === true, 'connectedCallback should run asyncronously');
            });
        });

        it('should call renderedCallback asyncronously', () => {
            let flag = false;
            const def = class MyComponent extends Element {
                renderedCallback() {
                    flag = true;
                }
            }
            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', def, {});
            target.patch(elm, vnode);
            assert(flag === false, 'renderedCallback should not run syncronously');
            return Promise.resolve().then(() => {
                assert(flag === true, 'renderedCallback should run asyncronously');
            });
        });

        it('should preserve the creation order and the hook order', () => {
            let chars = '^';
            const def1 = class MyComponent extends Element {
                connectedCallback() {
                    chars += 'connected-1:';
                }
                renderedCallback() {
                    chars += 'rendered-1:';
                }
            }
            const def2 = class MyComponent extends Element{
                connectedCallback() {
                    chars += 'connected-2:';
                }
                renderedCallback() {
                    chars += 'rendered-2:';
                }
            }
            const elm1 = document.createElement('x-foo');
            const vnode1 = api.c('x-foo', def1, {});
            target.patch(elm1, vnode1);
            const elm2 = document.createElement('x-bar');
            const vnode2 = api.c('x-bar', def2, {});
            target.patch(elm2, vnode2);
            assert.equal(chars, '^');
            return Promise.resolve().then(() => {
                assert.equal(chars, '^rendered-1:connected-1:rendered-2:connected-2:');
            });
        });

    });
});
