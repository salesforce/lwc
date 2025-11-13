describe('JSON.stringify on proxies', () => {
    it('should return proper value for simple object', function () {
        const arr = new Proxy(
            {
                x: 'x',
                y: 'y',
            },
            {}
        );

        const actual = JSON.stringify(arr);
        expect(actual).toBe('{"x":"x","y":"y"}');
    });

    it('should return proper value for simple array', function () {
        const arr = new Proxy([1, 2], {});

        const actual = JSON.stringify(arr);
        expect(actual).toBe('[1,2]');
    });

    it('should return proper value for complex object', function () {
        const obj = new Proxy(
            {
                string: 'x',
                number: 1,
                boolean: true,
                undefined: undefined,
                null: null,
                object: { x: 'x' },
                [Symbol('symbol')]: true,
            },
            {}
        );

        const actual = JSON.stringify(obj);
        expect(actual).toBe(
            '{"string":"x","number":1,"boolean":true,"null":null,"object":{"x":"x"}}'
        );
    });

    it('should return proper value for nested proxies', function () {
        const nested = new Proxy(
            {
                x: new Proxy({ y: true }, {}),
                z: new Proxy([false], {}),
            },
            {}
        );

        const actual = JSON.stringify(nested);
        expect(actual).toBe('{"x":{"y":true},"z":[false]}');
    });
});
