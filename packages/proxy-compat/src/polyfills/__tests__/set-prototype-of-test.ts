import { setPrototypeOf } from './../set-prototype-of';

describe('set prototype of polyfill', function () {
    it('should handle arrays correctly', function () {
        var obj = {};
        setPrototypeOf(obj, []);
        expect(obj instanceof Array).toBe(true);
    });

    it('should handle exotics correctly', function () {
        var obj = {};
        setPrototypeOf(obj, window.document);
        expect(obj instanceof Document).toBe(true);
    });

    it('should handle custom constructors correctly', function () {
        function Foo() {}
        var obj = {};
        setPrototypeOf(obj, new Foo());
        expect(obj instanceof Foo).toBe(true);
    });
});