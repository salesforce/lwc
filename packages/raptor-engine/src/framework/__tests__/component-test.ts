import * as target from '../component';
import assert from 'power-assert';
import { Element } from "../html-element";
import * as api from "../api";
import { patch } from '../patch';

describe('component', function () {

    describe('#createComponent()', () => {
        it('should throw for non-object values', () => {
            assert.throws(() => target.createComponent(undefined), "undefined value");
            assert.throws(() => target.createComponent(""), "empty string value");
            assert.throws(() => target.createComponent(NaN), "NaN value");
            assert.throws(() => target.createComponent(function () {}));
            assert.throws(() => target.createComponent(1), "Number value");
        });
    });


    describe('attribute-change-life-cycle', () => {
        it('should not invoke attributeChangeCallback() when initializing props', () => {
            let counter = 0;
            class MyComponent extends Element {
                constructor() {
                    super();
                    this.x = 1;
                }
                attributeChangedCallback() {
                    counter++;
                }
            }
            MyComponent.publicProps = {x: true}
            MyComponent.observedAttributes = ['x'];
            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode);
            return Promise.resolve().then(() => {
                assert.strictEqual(0, counter);
            });
        });
        it('should invoke attributeChangeCallback() with previous value from constructor', () => {
            let keyValue, oldValue, newValue, counter = 0;
            class MyComponent extends Element {
                constructor() {
                    super();
                    this.x = 1;
                }
                attributeChangedCallback(k, o, n) {
                    oldValue = o;
                    newValue = n;
                    keyValue = k;
                    counter++;
                }
            }
            MyComponent.publicProps = {x: true}
            MyComponent.observedAttributes = ['x'];
            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', MyComponent, { props: { x: 2 } });
            patch(elm, vnode);
            return Promise.resolve().then(() => {
                assert.strictEqual(1, counter);
                assert.strictEqual('x', keyValue);
                assert.strictEqual(1, oldValue);
                assert.strictEqual(2, newValue);
            });
        });
    });

});
