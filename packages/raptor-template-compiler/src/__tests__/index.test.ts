import compiler from '../index';

describe('option validation', () => {
    it('validated presence of options', () => {
        expect(() => {
            // Use call to escape typescript type checking
            compiler.call(null, `<template></template>`);
        }).toThrow(
            /Compiler options must be an object/,
        );
    });

    it('throws for unknown compiler option', () => {
        expect(() => {
            compiler(`<template></template>`, { foo: true } as any);
        }).toThrow(
            /Unknown option property foo/,
        );
    });
});
