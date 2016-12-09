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
});
