describe('Function arguments', () => {
    it('should have correct message', () => {
        function argumentsTest() {
            return arguments[0].foo;
        }
        const actual = argumentsTest({ foo: 'bar' });
        expect(actual).toBe('bar');
    });

    it('should iterate correctly', () => {
        function argumentsIterate() {
            const res = [];
            for (let i = 0; i < arguments.length; i += 1) {
                res.push(arguments[i] + 1);
            }
            return res;
        }
        const actual = argumentsIterate(1, 2, 3);
        expect(actual).toEqual([2, 3, 4]);
    });
});
