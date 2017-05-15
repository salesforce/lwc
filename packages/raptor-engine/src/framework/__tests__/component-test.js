import * as target from '../component';
import assert from 'power-assert';

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
});
