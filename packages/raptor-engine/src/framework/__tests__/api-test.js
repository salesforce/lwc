import * as target from '../api.js';
import assert from 'power-assert';

describe('api.js', () => {

    describe('#c()', () => {
        // TBD
    });

    describe('#v()', () => {
        // TBD
    });

    describe('#n()', () => {
        // TBD
    });

    describe('#i()', () => {
        it('should support various types', () => {
            assert.deepEqual(target.i([], () => null), [], 'empty array');
            assert.deepEqual(target.i(undefined, () => null), [], 'undefined');
            assert.deepEqual(target.i(null, () => null), [], 'null');
        });
        it('should support numeric keys', () => {
            assert.deepEqual(target.i([{key: 0}], () => null), [null], 'numeric key');
            assert.deepEqual(target.i([{key: 1}], () => null), [null], 'another numeric key');
        });
        it('should provide item and index', () => {
            const o = {x: 1};
            assert.deepEqual(target.i([o], (item, index) => {
                return { index, item };
            }), [{ index: 0, item: o }]);
        });
    });

    describe('#f()', () => {
        // TBD
    });

});
