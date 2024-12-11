import { parseModule } from 'meriyah';
import { generate } from 'astring';
import { describe, beforeAll, test, expect } from 'vitest';
import { transmogrify } from '../transmogrify';
import type { Program as EsProgram } from 'estree';

const COMPILED_CMP = `
    async function* tmpl(props, attrs, slottedContent, Cmp, instance) {
      yield "<p";
      yield stylesheetScopeTokenClass;
      yield ">Hello</p>";
    }

    function* somethingElse() {
      yield "doit";
    }
    async function* something() {
      yield "foobar";
      yield* somethingElse();
    }
    class Basic extends LightningElement {
      static renderMode = "light";
      async connectedCallback() {
        for await (const thing of something()) {
          console.log(thing);
        }
      }
    }
    const __REFLECTED_PROPS__ = [];
    async function* generateMarkup(tagName, props, attrs, slotted) {
      attrs = attrs ?? ({});
      const instance = new Basic({
        tagName: tagName.toUpperCase()
      });
      instance[SYMBOL__SET_INTERNALS](props, __REFLECTED_PROPS__, attrs);
      instance.isConnected = true;
      if (instance.connectedCallback) {
        mutationTracker.enable(instance);
        instance.connectedCallback();
        mutationTracker.disable(instance);
      }
      const tmplFn = tmpl ?? fallbackTmpl;
      yield \`<\${tagName}\`;
      yield tmplFn.stylesheetScopeTokenHostClass ?? '';
      yield* renderAttrs(instance, attrs);
      yield '>';
      yield* tmplFn(props, attrs, slotted, Basic, instance);
      yield \`</\${tagName}>\`;
    }
`;

describe('transmogrify', () => {
    let COMPILED_CMP_SYNC: string;
    let COMPILED_CMP_ASYNC: string;

    beforeAll(() => {
        const COMPILED_CMP_AST = parseModule(COMPILED_CMP, {
            module: true,
            next: true,
        }) as EsProgram;
        const COMPILED_CMP_AST_SYNC = transmogrify(COMPILED_CMP_AST, 'sync');
        const COMPILED_CMP_AST_ASYNC = transmogrify(COMPILED_CMP_AST, 'async');
        COMPILED_CMP_SYNC = generate(COMPILED_CMP_AST_SYNC);
        COMPILED_CMP_ASYNC = generate(COMPILED_CMP_AST_ASYNC);
    });

    describe('in sync mode', () => {
        test('generateMarkup is transformed into sync mode', () => {
            expect(COMPILED_CMP_SYNC).not.toContain('async function* generateMarkup');
            expect(COMPILED_CMP_SYNC).not.toContain('async function generateMarkup');
            expect(COMPILED_CMP_SYNC).toContain('function generateMarkup($$emit');

            expect(COMPILED_CMP_SYNC).not.toContain('yield* renderAttrs');
            expect(COMPILED_CMP_SYNC).toContain('renderAttrs($$emit');

            expect(COMPILED_CMP_SYNC).not.toContain('yield ">"');
            expect(COMPILED_CMP_SYNC).not.toContain("yield '>'");
            expect(COMPILED_CMP_SYNC).toContain('$$emit(">")');
        });

        test('tmpl is transformed into sync mode', () => {
            expect(COMPILED_CMP_SYNC).not.toContain('async function* tmpl');
            expect(COMPILED_CMP_SYNC).not.toContain('async function tmpl');
            expect(COMPILED_CMP_SYNC).toContain('function tmpl($$emit');

            expect(COMPILED_CMP_SYNC).not.toContain('yield "<p"');
            expect(COMPILED_CMP_SYNC).toContain('$$emit("<p")');

            expect(COMPILED_CMP_SYNC).not.toContain('yield stylesheetScopeTokenClass');
            expect(COMPILED_CMP_SYNC).toContain('$$emit(stylesheetScopeTokenClass)');
        });

        test('component code is not transformed into sync mode', () => {
            expect(COMPILED_CMP_SYNC).toContain('async connectedCallback() {');
            expect(COMPILED_CMP_SYNC).toContain('for await (const thing of something())');
            expect(COMPILED_CMP_SYNC).toContain('function* somethingElse()');
            expect(COMPILED_CMP_SYNC).toContain('async function* something()');
            expect(COMPILED_CMP_SYNC).toContain('yield "doit"');
            expect(COMPILED_CMP_SYNC).toContain('yield "foobar"');
            expect(COMPILED_CMP_SYNC).toContain('yield* somethingElse()');
        });
    });

    describe('in async mode', () => {
        test('generateMarkup is transformed into async mode', () => {
            expect(COMPILED_CMP_ASYNC).not.toContain('async function* generateMarkup');
            expect(COMPILED_CMP_ASYNC).toContain('async function generateMarkup($$emit');

            expect(COMPILED_CMP_ASYNC).not.toContain('yield* renderAttrs');
            expect(COMPILED_CMP_ASYNC).toContain('renderAttrs($$emit');

            expect(COMPILED_CMP_ASYNC).not.toContain('yield ">"');
            expect(COMPILED_CMP_ASYNC).not.toContain("yield '>'");
            expect(COMPILED_CMP_ASYNC).toContain('$$emit(">")');
        });

        test('tmpl is transformed into async mode', () => {
            expect(COMPILED_CMP_ASYNC).not.toContain('async function* tmpl');
            expect(COMPILED_CMP_ASYNC).toContain('async function tmpl($$emit');

            expect(COMPILED_CMP_ASYNC).not.toContain('yield "<p"');
            expect(COMPILED_CMP_ASYNC).toContain('$$emit("<p")');

            expect(COMPILED_CMP_ASYNC).not.toContain('yield stylesheetScopeTokenClass');
            expect(COMPILED_CMP_ASYNC).toContain('$$emit(stylesheetScopeTokenClass)');
        });

        test('component code is not transformed into async mode', () => {
            expect(COMPILED_CMP_ASYNC).toContain('async connectedCallback() {');
            expect(COMPILED_CMP_ASYNC).toContain('for await (const thing of something())');
            expect(COMPILED_CMP_ASYNC).toContain('function* somethingElse()');
            expect(COMPILED_CMP_ASYNC).toContain('async function* something()');
            expect(COMPILED_CMP_ASYNC).toContain('yield "doit"');
            expect(COMPILED_CMP_ASYNC).toContain('yield "foobar"');
            expect(COMPILED_CMP_ASYNC).toContain('yield* somethingElse()');
        });
    });
});
