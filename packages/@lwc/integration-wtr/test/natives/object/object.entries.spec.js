describe('Plain Object', () => {
    it('should return proper value for simple object', () => {
        const actual = Object.entries({ x: 'x', y: 42 }).join('|');
        expect(actual).toBe('x,x|y,42');
    });

    it('should return proper value for array-like object', () => {
        const actual = Object.entries({ 0: 'a', 1: 'b', 2: 'c' }).join('|');
        expect(actual).toBe('0,a|1,b|2,c');
    });

    it('should return ordered keys', () => {
        const actual = Object.entries({ 100: 'a', 2: 'b', 7: 'c' }).join('|');
        expect(actual).toBe('2,b|7,c|100,a');
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

        const actual = Object.entries(myObj).join('|');
        expect(actual).toBe('z,z');
    });

    it('should handle non-object values', () => {
        const actual = Object.entries('foo').join('|');
        expect(actual).toBe('0,f|1,o|2,o');
    });

    it('should omit symbol properties', () => {
        const actual = Object.entries({
            x: 'x',
            y: 42,
            [Symbol('z')]: 'z',
        }).join('|');
        expect(actual).toBe('x,x|y,42');
    });

    it('should support iterable protocol', () => {
        let actual = '';
        const obj = { x: 'x', y: 42 };

        for (const [key, value] of Object.entries(obj)) {
            actual += `[${key}:${value}]`;
        }

        expect(actual).toBe('[x:x][y:42]');
    });

    it('should support array operations', () => {
        const actual = Object.entries({ x: 'x', y: 42 }).reduce((acc, [key, value]) => {
            return acc + `[${key}:${value}]`;
        }, '');
        expect(actual).toBe('[x:x][y:42]');
    });
});

describe('Proxy Object', () => {
    it('should return proper value for simple object', () => {
        const proxy = new Proxy({ x: 'x', y: 42 }, {});
        const actual = Object.entries(proxy).join('|');
        expect(actual).toBe('x,x|y,42');
    });

    it('should return proper value for array-like object', () => {
        const proxy = new Proxy({ 0: 'a', 1: 'b', 2: 'c' }, {});
        const actual = Object.entries(proxy).join('|');
        expect(actual).toBe('0,a|1,b|2,c');
    });

    it('should return ordered keys', () => {
        const proxy = new Proxy({ 100: 'a', 2: 'b', 7: 'c' }, {});
        const actual = Object.entries(proxy).join('|');
        expect(actual).toBe('2,b|7,c|100,a');
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
        const actual = Object.entries(proxy).join('|');
        expect(actual).toBe('z,z');
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
        const actual = Object.entries(proxy).join('|');
        expect(actual).toBe('x,x|y,42');
    });

    it('should support iterable protocol', () => {
        let actual = '';
        const proxy = new Proxy({ x: 'x', y: 42 }, {});

        for (const [key, value] of Object.entries(proxy)) {
            actual += `[${key}:${value}]`;
        }
        expect(actual).toBe('[x:x][y:42]');
    });

    it('should support array operations', () => {
        const proxy = new Proxy({ x: 'x', y: 42 }, {});
        const actual = Object.entries(proxy).reduce((acc, [key, value]) => {
            return acc + `[${key}:${value}]`;
        }, '');
        expect(actual).toBe('[x:x][y:42]');
    });
});
