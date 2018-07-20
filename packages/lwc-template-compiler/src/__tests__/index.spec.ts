import compiler, { compileToFunction } from '../index';

function prettify(str) {
    return str.toString()
        .replace(/^\s+|\s+$/, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length)
        .join('\n');
}

function functionMatchCode(fn, code) {
    return expect(
        prettify(fn.toString()),
    ).toContain(
        prettify(code),
    );
}

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

describe('compileToFunction', () => {
    it('should compile correctly simple components', () => {
        const renderFn = compileToFunction(`
            <template>
                <h1>Hello world!</h1>
            </template>
        `);

        functionMatchCode(renderFn, `
            function tmpl($api, $cmp, $slotset, $ctx) {
              const {
                  t: api_text,
                  h: api_element
                } = $api;

              return [api_element("h1", {
                    key: 1
                }, [api_text("Hello world!")])];
            }

            return tmpl;
        `);
    });

    it('should add component lookups if necessary', () => {
        const renderFn = compileToFunction(`
            <template>
                <x-foo></x-foo>
            </template>
        `);

        functionMatchCode(renderFn, `
            const _xFoo = modules["x-foo"];

            function tmpl($api, $cmp, $slotset, $ctx) {
              const {
                  c: api_custom_element
                } = $api;

              return [api_custom_element("x-foo", _xFoo, {
                    key: 1
                }, [])];
            }

            return tmpl;
        `);
    });

    it('should add template metadata if necessary', () => {
        const renderFn = compileToFunction(`
            <template>
                <slot></slot>
            </template>
        `);

        functionMatchCode(renderFn, `
            function tmpl($api, $cmp, $slotset, $ctx) {
                const {
                    s: api_slot
                } = $api;

                return [api_slot("", {
                    key: 1
                }, [], $slotset)];
            }
            tmpl.slots = [""];

            return tmpl;
        `);
    });
});
