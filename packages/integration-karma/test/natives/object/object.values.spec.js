describe('Object.values', () => {
    describe('Plain Object', () => {
        it('should return proper value for simple object', () => {
            const actual = Object.values({ x: 'x', y: 42 }).join('|');
            expect(actual).toBe('x|42');
        });

        it('should return proper value for array-like object', () => {
            const actual = Object.values({ 0: 'a', 1: 'b', 2: 'c' }).join('|');
            expect(actual).toBe('a|b|c');
        });

        it('should return ordered keys', () => {
            const actual = Object.values({ 100: 'a', 2: 'b', 7: 'c' }).join('|');
            expect(actual).toBe('b|c|a');
        });

        it('should omit not-enumerable properties', () => {
            const myObj = Object.create(
                {},
                {
                    x: {
                        value() {
                            return this.z;
                        },
                        enumerable: false,
                    },
                    y: { value: 'y', enumerable: false },
                    z: { value: 'z', enumerable: true },
                }
            );

            const actual = Object.values(myObj).join('|');
            expect(actual).toBe('z');
        });

        it('should handle non-object values', () => {
            const actual = Object.values('foo').join('|');
            expect(actual).toBe('f|o|o');
        });

        it('should omit symbol properties', () => {
            const actual = Object.values({
                x: 'x',
                y: 42,
                [Symbol('z')]: 'z',
            }).join('|');
            expect(actual).toBe('x|42');
        });
    });

    describe('Proxy Object', () => {
        it('should return proper value for simple object', () => {
            const proxy = new Proxy({ x: 'x', y: 42 }, {});
            const actual = Object.values(proxy).join('|');
            expect(actual).toBe('x|42');
        });

        it('should return proper value for array-like object', () => {
            const proxy = new Proxy({ 0: 'a', 1: 'b', 2: 'c' }, {});
            const actual = Object.values(proxy).join('|');
            expect(actual).toBe('a|b|c');
        });

        it('should return ordered keys', () => {
            const proxy = new Proxy({ 100: 'a', 2: 'b', 7: 'c' }, {});
            const actual = Object.values(proxy).join('|');
            expect(actual).toBe('b|c|a');
        });

        it('should omit not-enumerable properties', () => {
            const obj = Object.create(
                {},
                {
                    x: {
                        value() {
                            return this.z;
                        },
                        enumerable: false,
                    },
                    y: { value: 'y', enumerable: false },
                    z: { value: 'z', enumerable: true },
                }
            );

            const proxy = new Proxy(obj, {});
            const actual = Object.values(proxy).join('|');
            expect(actual).toBe('z');
        });

        it('should omit symbol properties', () => {
            const proxy = new Proxy(
                {
                    x: 'x',
                    y: 42,
                    [Symbol('z')]: 'z',
                },
                {}
            );
            const actual = Object.values(proxy).join('|');
            expect(actual).toBe('x|42');
        });
    });
});
