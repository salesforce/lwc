import * as target from '../utils';
import assert from 'power-assert';

describe('utils', () => {
    describe('#addCallbackToNextTick()', () => {

        it('should throw for non-callable values', () => {
            assert.throws(() => target.addCallbackToNextTick(undefined), "undefined value");
            assert.throws(() => target.addCallbackToNextTick(""), "empty string value");
            assert.throws(() => target.addCallbackToNextTick(NaN), "NaN value");
            assert.throws(() => target.addCallbackToNextTick({}), "Object");
            assert.throws(() => target.addCallbackToNextTick(1), "Number value");
        });

        it('should call callback asyncronously', () => {
            let flag = false;
            target.addCallbackToNextTick(() => {
                flag = true;
            });
            assert(flag === false, 'callback should not run syncronously');
            return Promise.resolve().then(() => {
                assert(flag === true, 'callback should run asyncronously');
            });
        });

        it('should call the callback once', () => {
            let counter = 0;
            target.addCallbackToNextTick(() => {
                counter += 1;
            });
            assert(counter === 0, 'callback should not run syncronously');
            return Promise.resolve().then(() => {
                // wait for another tick
                return Promise.resolve().then(() => {
                    assert(counter === 1, 'callback should call the callback only once');
                });
            });
        });

        it('should preserve the order of the callbacks', () => {
            let chars = 'a';
            target.addCallbackToNextTick(() => {
                chars += 'b';
            });
            target.addCallbackToNextTick(() => {
                chars += 'c';
            });
            assert(chars === 'a', 'callback should not run syncronously');
            return Promise.resolve().then(() => {
                assert(chars === 'abc', 'callback should run asyncronously in the order of addition');
            });
        });

        it('should release the references after ticking', () => {
            let chars = 'a';
            target.addCallbackToNextTick(() => {
                chars += 'b';
            });
            assert(chars === 'a', 'callback should not run syncronously');
            return Promise.resolve().then(() => {
                assert(chars === 'ab', 'callback should run asyncronously in the order of addition');
                target.addCallbackToNextTick(() => {
                    chars += 'c';
                });
                // wait for another tick
                return Promise.resolve().then(() => {
                    assert(chars === 'abc', 'callback should not be called in the second tick');
                });
            });
        });

    });

});
