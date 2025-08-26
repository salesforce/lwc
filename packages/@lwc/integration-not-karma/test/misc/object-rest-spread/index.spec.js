import { DISABLE_OBJECT_REST_SPREAD_TRANSFORMATION } from 'test-utils';

// It's useful to have Karma tests for this, so that we confirm legacy browsers still work
describe('object rest spread transformation', () => {
    it('applies the correct transformation based on API version', () => {
        // this function will be compiled by @lwc/compiler
        function test() {
            let obj = { foo: 'foo' };
            obj = { ...obj, bar: 'bar' };
            return obj;
        }

        expect(test()).toEqual({ foo: 'foo', bar: 'bar' });

        if (DISABLE_OBJECT_REST_SPREAD_TRANSFORMATION) {
            // native format
            expect(test.toString()).toContain('...');
        } else {
            // babel polyfill format
            expect(test.toString()).not.toContain('...');
        }
    });
});
