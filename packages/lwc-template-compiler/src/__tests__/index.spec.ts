import compiler, { compileToFunction } from '../index';
import { Config } from '../config';

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
    it('validate presence of options', () => {
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

    it('allows available options', () => {
        expect.assertions(1);
        const res = compiler(`<template></template>`, {
            namespace: 'namespace',
            computedMemberExpression: false,
        } as Config);
        expect(res).toBeDefined();
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

    it('should not make any changes to the custom element tag if namespace value is empty', () => {
        const renderFn = compileToFunction(`
            <template>
                <c-foo></c-foo>
            </template>
        `, { namespace: ''});

        functionMatchCode(renderFn, `
            const _cFoo = modules["c-foo"];

            function tmpl($api, $cmp, $slotset, $ctx) {
              const {
                  c: api_custom_element
                } = $api;

              return [api_custom_element("c-foo", _cFoo, {
                    key: 1
                }, [])];
            }

            return tmpl;
        `);
    });

    it('should not make changes to the custom element tag if configured namespace is "c"', () => {
        const renderFn = compileToFunction(`
            <template>
                <c-foo></c-foo>
            </template>
        `, { namespace: 'c'});

        functionMatchCode(renderFn, `
            const _cFoo = modules["c-foo"];

            function tmpl($api, $cmp, $slotset, $ctx) {
              const {
                  c: api_custom_element
                } = $api;

              return [api_custom_element("c-foo", _cFoo, {
                    key: 1
                }, [])];
            }

            return tmpl;
        `);
    });

    it('should replace custom element "c-" tag with configured namespace value', () => {
        const renderFn = compileToFunction(`
            <template>
                <c-foo></c-foo>
                <x-foo></x-foo>
                <div>
                    <c-bar></c-bar>
                </div>
                <nested-c-foo></nested-c-foo>
            </template>
        `, { namespace: 'ns'});

        functionMatchCode(renderFn, `
            const _nsFoo = modules["ns-foo"];
            const _xFoo = modules["x-foo"];
            const _nsBar = modules["ns-bar"];
            const _nestedCFoo = modules["nested-c-foo"];

            function tmpl($api, $cmp, $slotset, $ctx) {
                const {
                    c: api_custom_element,
                    h: api_element
                } = $api;

                return [api_custom_element("ns-foo", _nsFoo, {
                    key: 1
                }, []), api_custom_element("x-foo", _xFoo, {
                    key: 2
                }, []), api_element("div", {
                    key: 4
                }, [api_custom_element("ns-bar", _nsBar, {
                    key: 3
                }, [])]), api_custom_element("nested-c-foo", _nestedCFoo, {
                    key: 5
                }, [])];
                }
                return tmpl;
            }
        `);
    });
});
