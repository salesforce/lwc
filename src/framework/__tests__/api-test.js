import * as target from '../api.js';
import assert from 'power-assert';

describe('api.js', () => {

    describe('#e()', () => {
        it('should always return empty string', () => {
            assert(target.e() === '');
            assert(target.e('something') === '');
        });
    });

    describe('#s()', () => {
        it('should always cast to string', () => {
            assert(target.s() === '', 'undefined value');
            assert(target.s('') === '', 'empty string');
            assert(target.s('something') === 'something', 'string value');
            assert(target.s({}) === '[object Object]', 'object value');
            assert(target.s([1, 2]) === '1,2', 'array value');
            assert(target.s(1) === '1', 'number');
            assert(target.s(-1) === '-1', 'negative number');
            assert(target.s(0) === '0', 'the value of zero');
            assert(target.s(NaN) === 'NaN', 'NaN value');
            assert(target.s({ toString: () => 'something' }) === 'something', 'object with custom toString() member');
        });
        it('should return empty string for null', () => {
            assert(target.s(null) === '');
        });
    });

    describe('#v()', () => {
        // TBD
    });

    describe('#i()', () => {
        // TBD
    });

    describe('#f()', () => {
        // TBD
    });

});
