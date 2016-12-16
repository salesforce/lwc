import * as target from '../attributes.js';
import assert from 'power-assert';

describe('attributes.js', function () {
    describe('#getAttributesConfig()', function () {
        it('returns {} as default', function () {
            assert.deepEqual(target.getAttributesConfig(), {});
        });
    });

    describe('#attribute()', function () {
        it('returns Object with getter and setter', function () {
            var attr = target.attribute({}, "foo", {});
            assert(attr.get !== undefined);
            assert(attr.set !== undefined);
        });

        it('throws called on same attribute twice', function () {
            var obj = {};
            target.attribute(obj, "foo", {});
            assert.throws(
                () => {
                    target.attribute(obj, "foo", {});
                }
            );
        });

        it('can add multiple attributes to same target', function () {
            var obj = {}
            target.attribute(obj, "foo", {});
            target.attribute(obj, "bar", {});
            var attrConfig = target.getAttributesConfig(obj);
            assert(attrConfig.foo !== undefined);
            assert(attrConfig.bar !== undefined);
        });
    });

    describe('#getAttributeProxy()', () => {
        it('should throw for non-object values', () => {
            assert.throws(() => target.getAttributeProxy(undefined), "undefined value");
            assert.throws(() => target.getAttributeProxy(""), "empty string value");
            assert.throws(() => target.getAttributeProxy(NaN), "NaN value");
            assert.throws(() => target.getAttributeProxy(function () {}));
            assert.throws(() => target.getAttributeProxy(1), "Number value");
        });
        it('should return null for null value', () => {
            assert(target.getAttributeProxy(null) === null);
        });
        it('should always return the same proxy', () => {
            const o = { x: 1 };
            const first = target.getAttributeProxy(o);
            const second = target.getAttributeProxy(o);
            assert(first.x === second.x);
            assert(first === second);
        });
        it('should never rewrap a previously produced proxy', () => {
            const o = { x: 1 };
            const first = target.getAttributeProxy(o);
            const second = target.getAttributeProxy(first);
            assert(first.x === second.x);
            assert(first === second);
        });
        it('should rewrap unknown proxy', () => {
            const o = { x: 1 };
            const first = new Proxy(o, {});
            const second = target.getAttributeProxy(first);
            assert(first.x === second.x);
            assert(first !== second);
        });
    });
});
