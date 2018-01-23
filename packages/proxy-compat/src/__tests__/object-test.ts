import { patchedAssign, OwnPropertyKeys } from './../object';
import { XProxy } from './../xproxy';

describe('ECMA Object', function () {
    describe('OwnPropertyKeys', function () {
        it('should return object property keys', function () {
            expect(OwnPropertyKeys({ foo: 'bar', fizz: 'buzz' })).toEqual(['foo', 'fizz']);
        });

        // Skipping this for now
        // We do not patch Object.getOwnPropertySymbols because
        // it is patched by the Symbol polyfill later on
        // in the code. As a result, this test will not work in node.
        // See lwc(internal) #833
        xit('should return correct keys from proxy', function () {
            const proxy = new XProxy({
                foo: 'bar'
            }, {});

            expect(OwnPropertyKeys(proxy)).toEqual(['foo']);
        });
    });

    describe('assign', function () {
        it('should assign values correctly', function () {
            const obj = { a: 'b' };
            const assigned = {};
            patchedAssign(assigned, obj);
            expect(assigned).toEqual({
                a: 'b'
            });
        });

        // Skipping this for now
        // We do not patch Object.getOwnPropertySymbols because
        // it is patched by the Symbol polyfill later on
        // in the code. As a result, this test will not work in node.
        // See lwc(internal) #833
        xit('should assign symbols correctly', function () {
            const sym = Symbol();
            const proxy = new XProxy({ foo: 'bar', [sym]: 1 }, {});
            const obj = patchedAssign({ fizz: 'buzz' }, proxy);
            expect(obj).toEqual({
                [sym]: 1,
                foo: 'bar',
                fizz: 'buzz'
            });
        });
    });
});