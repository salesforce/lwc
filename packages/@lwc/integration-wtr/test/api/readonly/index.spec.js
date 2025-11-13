import { readonly } from 'lwc';

it('should log an error if no argument is provided', () => {
    expect(() => readonly()).toLogErrorDev(
        /@readonly cannot be used as a decorator just yet, use it as a function with one argument to produce a readonly version of the provided value./
    );
});

it('should log an error if more than one argument is passed', () => {
    expect(() => readonly({}, {})).toLogErrorDev(
        /@readonly cannot be used as a decorator just yet, use it as a function with one argument to produce a readonly version of the provided value./
    );
});

it('it should return a wrapped object', () => {
    const obj = { foo: true };
    const wrapObj = readonly(obj);

    expect(wrapObj).not.toBe(obj);
});

it('should throw when trying to mutate an object property', () => {
    const wrapObj = readonly({ foo: true });

    expect(() => {
        wrapObj.foo = false;
    }).toThrowError();
});
