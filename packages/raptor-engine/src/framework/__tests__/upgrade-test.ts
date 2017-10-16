import { Element } from "../html-element";
import { createElement } from "../upgrade";
import assert from 'power-assert';

describe('upgrade', () => {

    describe('#createElement()', () => {

        it('should allow access to profixied default values for public props', () => {
            const x = [1, 2, 3], y = { foo: 1 };
            type MyComponentElement = HTMLElement & {
                x: any,
                y: any;
            }
            const def = class MyComponent extends Element {
                x: any;
                y: any;
                constructor() {
                    super();
                    this.x = x;
                    this.y = y;
                }

                static publicProps = {
                    x: true,
                    y: true
                }
            }
            const elm: MyComponentElement = createElement('x-foo', { is: def }) as MyComponentElement;
            expect(x).toEqual(elm.x);
            expect(y).toEqual(elm.y);
            assert(elm.x !== x, 'property x should be profixied');
            assert(elm.y !== y, 'property y should be profixied');
        });

        it('should proxify any value before setting a property', () => {
            const def = class MyComponent extends Element {}
            def.publicProps = { x: 1 };
            const elm = createElement('x-foo', { is: def });
            const o = { foo: 1 };
            elm.x = o;
            expect(o).toEqual(elm.x);
            assert(elm.x !== o, 'property x should be profixied');
        });

    });

    describe('patches for Node.', () => {

        beforeEach(() => {
            document.body.innerHTML = '';
        });

        it('appendChild()', () => {
            const el = document.createElement('div');
            assert.strictEqual(document.body.appendChild(el), el);
            assert.strictEqual(el.parentNode, document.body);
        });

        it('insertBefore()', () => {
            const el = document.createElement('div');
            const anchor = document.createElement('p');
            document.body.appendChild(anchor);
            assert.strictEqual(document.body.insertBefore(el, anchor), el);
            assert.strictEqual(el, document.body.firstChild);
        });

        it('removeChild()', () => {
            const el = document.createElement('div');
            document.body.appendChild(el);
            assert.strictEqual(document.body.removeChild(el), el);
            assert.strictEqual(null, el.parentNode);
        });

        it('replaceChild()', () => {
            const el = document.createElement('div');
            const anchor = document.createElement('p');
            document.body.appendChild(anchor);
            assert.strictEqual(document.body.replaceChild(el, anchor), anchor);
            assert.strictEqual(el, document.body.childNodes[0]);
            assert.strictEqual(1, document.body.childNodes.length);
        });

    });

});
