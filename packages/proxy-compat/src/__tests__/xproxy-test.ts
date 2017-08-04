import Proxy from "../main";
import assert from 'power-assert';

describe('Proxy', () => {

    describe('constructor', () => {

        it('should throw when target is not object', () => {
            assert.throws(() => {
                new Proxy();
            });
            assert.throws(() => {
                new Proxy(null, {});
            });
            assert.throws(() => {
                new Proxy(undefined, {});
            });
            assert.throws(() => {
                new Proxy(0, {});
            });
            assert.throws(() => {
                new Proxy(1, {});
            });
        });

        it('should throw when handler is not an object', () => {
            assert.throws(() => {
                new Proxy({});
            });
            assert.throws(() => {
                new Proxy({}, null);
            });
            assert.throws(() => {
                new Proxy({}, 0);
            });
            assert.throws(() => {
                new Proxy({}, 1);
            });
        });

    });

});
