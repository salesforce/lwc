describe('Set Prototype Of', () => {
    it('should have set prototype correctly', function () {
        const obj = {};
        Object.setPrototypeOf(obj, []);
        const actual = obj instanceof Array;
        expect(actual).toBe(true);
    });

    it('should have set proxy prototype correctly', function () {
        const proxy = new Proxy(
            {},
            {
                setPrototypeOf(target) {
                    return Object.setPrototypeOf(target, document);
                },
            }
        );
        Object.setPrototypeOf(proxy, []);
        const actual = proxy instanceof Document;
        expect(actual).toBe(true);
    });

    it('should have ignored proto argument in favor of trap', function () {
        const proxy = new Proxy(
            {},
            {
                setPrototypeOf(target) {
                    return Object.setPrototypeOf(target, document);
                },
            }
        );
        Object.setPrototypeOf(proxy, []);
        const actual = proxy instanceof Array;
        expect(actual).toBe(false);
    });

    it('should have ignored proto argument in favor of trap', function () {
        const obj = {};
        const proto = [];
        Object.setPrototypeOf(obj, proto);
        const actual = Object.getPrototypeOf(obj) === proto;
        expect(actual).toBe(true);
    });
});
