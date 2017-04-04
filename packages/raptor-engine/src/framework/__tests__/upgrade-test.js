import { Element } from "../html-element.js";
import { createElement } from "../upgrade.js";
import assert from 'power-assert';

describe('upgrade.js', () => {

    describe('#createElement()', () => {

        it('should allow access to profixied default values for public props', () => {
            const x = [1, 2, 3], y = { foo: 1 };
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.x = x;
                    this.y = y;
                }
            }
            def.publicProps = { x: true, y: true };
            const elm = createElement('x-foo', { is: def });
            assert.deepEqual(elm.x, x);
            assert.deepEqual(elm.y, y);
            assert(elm.x !== x, 'property x should be profixied');
            assert(elm.y !== y, 'property y should be profixied');
        });

        it('should proxify any value before setting a property', () => {
            const def = class MyComponent extends Element {}
            def.publicProps = { x: 1 };
            const elm = createElement('x-foo', { is: def });
            const o = { foo: 1 };
            elm.x = o;
            assert.deepEqual(elm.x, o);
            assert(elm.x !== o, 'property x should be profixied');
        });

    });

});
