// This facade is used because the compiler will throw `IS_NOT_DECORATOR` if it detects a decorator
// imported from 'lwc' used as a non-decorator. But it can't detect when those same functions are
// re-exported from a facade!
import { api, track, wire } from './facade.js';

describe('decorator APIs used as non-decorators', () => {
    it('api() throws error', () => {
        expect(api).toThrowError(/@api decorator can only be used as a decorator function/);
    });

    it('wire() throws error', () => {
        expect(wire).toThrowError(/@wire\(adapter, config\?\) may only be used as a decorator/);
    });

    it('track() throws error when passed arguments !== 1', () => {
        const funcs = [
            () => track(),
            () => track('foo', 'bar'),
            () => track('foo', undefined),
            () => track('foo', 'bar', 'baz'),
            () => track('foo', undefined, 'baz'),
        ];

        for (const func of funcs) {
            expect(func).toThrowError(
                /@track decorator can only be used with one argument to return a trackable object, or as a decorator function/
            );
        }
    });

    it('track() returns reactive proxy when passed exactly 1 arg', () => {
        const obj = { foo: 'bar' };
        const proxy = track(obj);

        expect(proxy.foo).toBe('bar');
        expect(proxy).not.toBe(obj);
    });
});
