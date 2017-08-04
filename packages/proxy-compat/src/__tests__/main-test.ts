import Proxy from "../main";
import assert from 'power-assert';

describe('EcmaScript', () => {

    describe('intrinsics', () => {

        it('should support Arrays', () => {
            const o = new Proxy([1, 2], {});
            assert.strictEqual(Array.isArray(o), true);
            assert.strictEqual(Proxy.getKey(o, 'length'), 2);
            assert.strictEqual(Proxy.getKey(o, 0), 1);
            assert.strictEqual(Proxy.getKey(o, 1), 2);
            Proxy.setKey(o, '2', 3);
            assert.strictEqual(Proxy.getKey(o, 'length'), 3);
            assert.strictEqual(Proxy.getKey(o, 2), 3, 'expandos are not supported'); // expando
        });

        it('should support Object.keys()', () => {
            const o = new Proxy({ x: 1, y: 2 }, {});
            Proxy.setKey(o, 'z', 3); // expando
            assert.deepEqual(Object.keys(o), ['x', 'y', 'z']);
        });

        it('should support Object.getOwnPropertyNames()', () => {
            const o = new Proxy({ x: 1, y: 2 }, {});
            Proxy.setKey(o, 'z', 3); // expando
            assert.deepEqual(Object.getOwnPropertyNames(o), ['x', 'y', 'z']);
        });

        it('should support Object.assign()', () => {
            const o = new Proxy({ x: 1, y: 2 }, {});
            Proxy.setKey(o, 'z', 3); // expando
            assert.deepEqual(Object.assign({}, o), { x: 1, y: 2, z: 3 });
        });

        it('should support Object.prototype.hasOwnProperty()', () => {
            const o = new Proxy({ x: 1, y: 2 }, {});
            assert.strictEqual(o.hasOwnProperty('x'), true);
            Proxy.setKey(o, 'z', 3); // expando
            assert.strictEqual(o.hasOwnProperty('z'), true);
            assert.strictEqual(Object.prototype.hasOwnProperty.call(o, 'z'), true);
        });

    });

});
