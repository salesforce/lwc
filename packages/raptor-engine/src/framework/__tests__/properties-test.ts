import * as target from '../properties';
import assert from 'power-assert';

describe('properties', function () {

    describe('#hookComponentLocalProperty()', function () {
        // TBD: mock for vm is needed here
    });

    describe('#getPropertyProxy()', () => {
        it('should throw for non-object values', () => {
            assert.throws(() => target.getPropertyProxy(undefined), "undefined value");
            assert.throws(() => target.getPropertyProxy(""), "empty string value");
            assert.throws(() => target.getPropertyProxy(NaN), "NaN value");
            assert.throws(() => target.getPropertyProxy(function () {}));
            assert.throws(() => target.getPropertyProxy(1), "Number value");
        });
        it('should return null for null value', () => {
            assert(target.getPropertyProxy(null) === null);
        });
        it('should always return the same proxy', () => {
            const o = { x: 1 };
            const first = target.getPropertyProxy(o);
            const second = target.getPropertyProxy(o);
            assert(first.x === second.x);
            assert(first === second);
        });
        it('should never rewrap a previously produced proxy', () => {
            const o = { x: 1 };
            const first = target.getPropertyProxy(o);
            const second = target.getPropertyProxy(first);
            assert(first.x === second.x);
            assert(first === second);
        });
        it('should rewrap unknown proxy', () => {
            const o = { x: 1 };
            const first = new Proxy(o, {});
            const second = target.getPropertyProxy(first);
            assert(first.x === second.x);
            assert(first !== second);
        });
    });
});
