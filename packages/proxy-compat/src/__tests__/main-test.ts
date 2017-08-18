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

        it('should support construction', function () {
            let count = 0;
            let ctorArgs;
            function Ctor () {}
            const ProxyCtor = new Proxy(Ctor, {
                construct: function (target, args) {
                    count += 1;
                    ctorArgs = args;
                    return {};
                }
            });
            new ProxyCtor([1, 2, 3]);
            assert(count === 1);
            assert.deepEqual(ctorArgs, [[1, 2, 3]]);
        });

        it('should support apply', function () {
            let count = 0;
            let callArgs;
            let callThis;
            let rv = {};
            let thisArg = {};
            function handler () {}
            const proxyHandler = new Proxy(handler, {
                apply: function (target, thisArg, args) {
                    count += 1;
                    callArgs = args;
                    callThis = thisArg;
                    return rv;
                }
            });
            const functionReturn = proxyHandler.call(thisArg, [1, 2, 3]);
            assert(count === 1);
            assert(callThis, thisArg);
            assert.deepEqual(callArgs, [[1, 2, 3]]);
            assert(functionReturn, rv);
        });

        it('should support getOwnPropertyDescriptor with XProxy objects', () => {
            let count = 0;
            const obj = { x: 1, y : 2 };
            const o = new Proxy(obj, {
                getOwnPropertyDescriptor: function (target, key) {
                    count += 1;
                    return Object.getOwnPropertyDescriptor(target, key);
                }
            });
            const descriptor = {
                value: 1,
                enumerable: true,
                configurable: true,
                writable: true
            };
            assert.deepEqual(Object.getOwnPropertyDescriptor(o, 'x'), descriptor);
            assert(count === 1);
        });

        it('should support preventExtensions with XProxy objects', () => {
            let count = 0;
            const o = new Proxy({ x: 1, y : 2 }, {
                preventExtensions: function (target) {
                    count += 1;
                    Object.preventExtensions(target);
                    return true;
                }
            });
            Object.preventExtensions(o);
            assert(count === 1);
            assert(Object.isExtensible(o) === false);
        });

        it('should support preventExtensions with vanilla objects', () => {
            const vanilla = {};
            Object.preventExtensions(vanilla);
            assert(Object.isExtensible(vanilla) === false);
        });

        it('should support getPrototypeOf', function () {
            let count = 0;
            const proto = {};
            const obj = Object.create(proto);
            const proxy = new Proxy(obj, {
                getPrototypeOf: function (target) {
                    count += 1;
                    return Object.getPrototypeOf(target);
                }
            });
            assert(Object.getPrototypeOf(proxy) === proto);
            assert(count === 1);
        });

        it('should support setPrototypeOf', function () {
            let count = 0;
            const proto = {};
            const obj = {};
            const proxy = new Proxy(obj, {
                setPrototypeOf: function (target, proto) {
                    count += 1;
                    Object.setPrototypeOf(target, proto);
                    return true;
                }
            });
            Object.setPrototypeOf(proxy, proto);
            assert(Object.getPrototypeOf(proxy) === proto);
            assert(Object.getPrototypeOf(obj) === proto);
            assert(count === 1);
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
