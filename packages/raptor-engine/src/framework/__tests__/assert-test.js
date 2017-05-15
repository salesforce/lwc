import target from '../assert';
import assert from 'power-assert';

describe('assert', function () {
    describe('#isTrue()', function () {
        it('should throw Error for false', () => {
            assert.throws(
                () => {
                    target.isTrue(false);
                }
            );
        });

        it('should throw correct default error message', () => {
            assert.throws(
                () => {
                    target.isTrue(false);
                },
                /Assert Violation/,
                "expected error with message 'Assert Violation'"
            );
        });

        it('should throw error that includes custom message', function () {
            assert.throws(
                () => {
                    target.isTrue(false, "foo bar");
                },
                /foo bar/
            );
        });

        it('should not throw error for true', function () {
            target.isTrue(true);
        });
    });

    describe('#vnode()', function () {
        it('should throw Error for undefined', function () {
            assert.throws(
                () => {
                    target.vnode();
                }
            );
        });
    });

    describe('#vm()', function () {
        it('should throw Error for undefined', function () {
            assert.throws(
                () => {
                    target.vnode();
                }
            );
        });
    });
});
