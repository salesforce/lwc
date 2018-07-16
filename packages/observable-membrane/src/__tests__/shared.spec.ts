import { isObservable } from './../shared';

describe('#isObservable', function() {
    it('should return true for plain objects', function() {
        const reactive = isObservable({});
        expect(reactive);
    });

    it('should return true for objects with null prototype', function() {
        const reactive = isObservable(Object.create(null));
        expect(reactive);
    });

    it('should return true for arrays', function() {
        const reactive = isObservable([]);
        expect(reactive);
    });

    it('should return false for functions', function() {
        const reactive = isObservable(function() {
            // do nothing
        });
        expect(!reactive);
    });

    it('should return false for false', function() {
        const reactive = isObservable(false);
        expect(!reactive);
    });

    it('should return false for null', function() {
        const reactive = isObservable(null);
        expect(!reactive);
    });

    it('should return false for undefined', function() {
        const reactive = isObservable(undefined);
        expect(!reactive);
    });

    it('should return false for true', function() {
        const reactive = isObservable(true);
        expect(!reactive);
    });

    it('should return false for number', function() {
        const reactive = isObservable(1);
        expect(!reactive);
    });

    it('should return false for string', function() {
        const reactive = isObservable('foo');
        expect(!reactive);
    });

    it('should return false for extended objects', function() {
        const obj = Object.create({});
        const reactive = isObservable(obj);
        expect(!reactive);
    });

    it('should handle cross realm objects', function() {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        const obj = (iframe.contentWindow as any).eval('({})');
        expect(isObservable(obj)).toBe(true);
    });
});
