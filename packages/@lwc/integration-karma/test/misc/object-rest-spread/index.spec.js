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

        if (process.env.API_VERSION <= 59) {
            // babel polyfill format
            expect(test.toString()).not.toContain('...');
        } else {
            // native format
            expect(test.toString()).toContain('...');
        }
    });
});
