import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '@babel/parser';
import { analyzeFile } from './analyzer.mjs';
import { transformSource } from './transformer.mjs';

function run(source) {
    const ast = parse(source, {
        sourceType: 'module',
        plugins: [
            'typescript',
            'decorators-legacy',
            'classProperties',
            'classPrivateProperties',
            'classPrivateMethods',
        ],
    });
    const analysis = analyzeFile(ast);
    return transformSource(ast, source, analysis);
}

// Reparse the transformed output to prove it is still syntactically valid TS.
function assertParses(code) {
    assert.doesNotThrow(() =>
        parse(code, {
            sourceType: 'module',
            plugins: ['typescript', 'decorators-legacy', 'classProperties'],
        })
    );
}

function rx(literal) {
    return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('confusables transformer', () => {
    it('renames a local binding and all its references consistently', () => {
        const out = run(`function f() {\n  const localVar = 1;\n  return localVar + localVar;\n}`);
        assertParses(out);
        assert.doesNotMatch(out, /\blocalVar\b/);
        const renamed = out.match(/const (\S+) =/)[1];
        const refs = (out.match(new RegExp(rx(renamed), 'g')) || []).length;
        assert.equal(refs, 3); // declaration + two references
    });

    it('preserves exported (public) names', () => {
        const out = run(`export function publicFn(internalArg) {\n  return internalArg;\n}`);
        assertParses(out);
        assert.match(out, /\bpublicFn\b/);
        assert.doesNotMatch(out, /\binternalArg\b/);
    });

    it('preserves imported names', () => {
        const out = run(`import { thing } from 'x';\nfunction f() { return thing; }`);
        assertParses(out);
        assert.match(out, /\bthing\b/);
    });

    // Bug class: `import type` bindings have binding.kind 'unknown', not 'module'.
    it('preserves type-only import names (declaration and reference)', () => {
        const out = run(
            `import type { types } from '@babel/core';\n` +
                `import type * as NS from 'x';\n` +
                `export type A = typeof types;\nexport type B = typeof NS;`
        );
        assertParses(out);
        assert.match(out, /\btypes\b/);
        assert.match(out, /\bNS\b/);
    });

    it('preserves implicit globals (no resolvable binding)', () => {
        const out = run(`function f(n) { return isFinite(n) && parseInt(String(n)); }`);
        assertParses(out);
        assert.match(out, /\bisFinite\b/);
        assert.match(out, /\bparseInt\b/);
        assert.match(out, /\bString\b/);
        assert.doesNotMatch(out, /\bn\b/); // param renamed
    });

    // Bug class: type alias declared but reference not updated (language.ts BaseArray).
    it('leaves type-space names untouched (declaration and reference stay in sync)', () => {
        const out = run(
            `type BaseArray = readonly unknown[];\nfunction f(x: BaseArray): BaseArray { return x; }`
        );
        assertParses(out);
        const count = (out.match(/\bBaseArray\b/g) || []).length;
        assert.equal(count, 3);
    });

    // Bug class: object-expression shorthand against a contextual type (utils.ts { scope }).
    it('expands object-expression shorthand, keeping key ASCII', () => {
        const out = run(`function f(scope: string) {\n  return { scope };\n}`);
        assertParses(out);
        assert.match(out, /\{\s*scope:\s*\S+\s*\}/);
        assert.doesNotMatch(out, /return \{ scope \}/);
    });

    // Bug class: object-pattern (destructuring) shorthand.
    it('expands object-pattern shorthand, keeping source key ASCII', () => {
        const out = run(
            `function f(obj: { dir: string }) {\n  const { dir } = obj;\n  return dir;\n}`
        );
        assertParses(out);
        assert.match(out, /const \{ dir: \S+ \}/);
        assert.doesNotMatch(out, /return dir;/);
    });

    // Bug class: assertion signature references a parameter binding from type space.
    it('renames assertion-signature parameter in lockstep with the param', () => {
        const out = run(
            `function check(condition: unknown): asserts condition {\n  if (!condition) throw new Error('x');\n}`
        );
        assertParses(out);
        const renamed = out.match(/function \S+\((\S+):/)[1];
        assert.match(out, new RegExp(`asserts ${rx(renamed)}`));
        assert.doesNotMatch(out, /asserts condition/);
    });

    // Bug class: type predicate references a parameter binding from type space.
    it('renames type-predicate parameter in lockstep with the param', () => {
        const out = run(
            `function check(obj: unknown): obj is string {\n  return typeof obj === 'string';\n}`
        );
        assertParses(out);
        const renamed = out.match(/function \S+\((\S+):/)[1];
        assert.match(out, new RegExp(`${rx(renamed)} is string`));
        assert.doesNotMatch(out, /\bobj is string\b/);
    });

    it('preserves LightningElement component member names', () => {
        const out = run(
            `import { LightningElement } from 'lwc';\n` +
                `export default class Cmp extends LightningElement {\n` +
                `  greeting = 'hi';\n  handleClick() { return this.greeting; }\n}`
        );
        assertParses(out);
        assert.match(out, /\bgreeting\b/);
        assert.match(out, /\bhandleClick\b/);
    });

    // Bug class: TS `this` parameter is a contextual keyword, not a renameable binding.
    it('never renames a `this` parameter', () => {
        const out = run(`const f = function (this: HTMLElement): unknown {\n  return this;\n};`);
        assertParses(out);
        assert.match(out, /function \(this: HTMLElement\)/);
    });

    // Bug class: shorthand pattern with a default keeps its ASCII key (utils.ts { kind = 'method' }).
    it('keeps the key ASCII for a shorthand pattern with a default', () => {
        const out = run(
            `function f(el: { namespace?: string }) {\n  const { namespace = '' } = el;\n  return namespace;\n}`
        );
        assertParses(out);
        // Key stays ASCII; value renamed via `{ namespace: <target> = '' }`.
        assert.match(out, /\{ namespace: \S+ = '' \}/);
    });

    // Bug class: exported destructuring locals ARE the export names (env/node.ts).
    it('preserves names bound by an exported destructuring', () => {
        const out = run(`const _N = {};\nexport const { ELEMENT_NODE, TEXT_NODE } = _N;`);
        assertParses(out);
        assert.match(out, /\bELEMENT_NODE\b/);
        assert.match(out, /\bTEXT_NODE\b/);
        // Must not have been aliased away (`ELEMENT_NODE: something`).
        assert.doesNotMatch(out, /ELEMENT_NODE:/);
    });

    // Bug class: a private field reference (`this.#x`) shares a name with a renameable local
    // (constructor param), and getBinding wrongly resolves the private name to it (context.ts).
    it('never renames a private class field even when a same-named local exists', () => {
        const out = run(
            `class C {\n  #providedContextVarieties;\n` +
                `  constructor(providedContextVarieties) {\n` +
                `    this.#providedContextVarieties = providedContextVarieties;\n  }\n}`
        );
        assertParses(out);
        // The `#field` declaration and `this.#field` use must remain identical.
        const decls = (out.match(/#providedContextVarieties\b/g) || []).length;
        assert.equal(decls, 2); // declaration + this.#field use
        // The constructor param (a real local) is still renamed.
        assert.doesNotMatch(out, /constructor\(providedContextVarieties\)/);
    });

    // Bug class: a class is a value binding referenced from type space (signal-tracker). The
    // value occurrences are renamed, so the type reference must rename in lockstep.
    it('renames a class reference in type position in lockstep with the value binding', () => {
        const out = run(
            `class SignalTracker {}\n` +
                `const m = new WeakMap<object, SignalTracker>();\n` +
                `function f(): SignalTracker { return new SignalTracker(); }`
        );
        assertParses(out);
        assert.doesNotMatch(out, /\bSignalTracker\b/);
        const renamed = out.match(/class (\S+) \{\}/)[1];
        // declaration + WeakMap type arg + return type + `new` = 4 occurrences, all identical.
        const count = (out.match(new RegExp(rx(renamed), 'g')) || []).length;
        assert.equal(count, 4);
    });

    // Bug class: a value parameter shares a name with a type parameter (estemplate.ts
    // `...Validators: Validators`). getBinding only tracks the value binding, so type references
    // to the type parameter must NOT be renamed (the type-param declaration stays ASCII).
    it('does not rename a type reference that collides with a renameable value name', () => {
        const out = run(
            `function g<Validators extends unknown[]>(\n` +
                `  ...Validators: Validators\n` +
                `): Wrap<Validators> {\n  return Validators as any;\n}`
        );
        assertParses(out);
        // The type-parameter declaration and both type references stay ASCII and in sync.
        const typeRefs = (out.match(/Validators/g) || []).length;
        // <Validators ...>, : Validators (annotation), Wrap<Validators> = at least the 3 type
        // positions remain ASCII. The value param + value reference are renamed.
        assert.ok(typeRefs >= 3, `expected >=3 ASCII Validators, got ${typeRefs}`);
        assert.match(out, /Wrap<Validators>/);
        assert.match(out, /<Validators extends/);
    });

    // Bug class: computed type-member key references a renamed value binding (node-ownership.ts).
    it('renames a computed type-member key in lockstep with its value binding', () => {
        const out = run(
            `const HostElementKey = '$$x$$';\n` +
                `interface ShadowedNode {\n  [HostElementKey]: number;\n}\n` +
                `function f(): typeof HostElementKey {\n  return HostElementKey;\n}`
        );
        assertParses(out);
        assert.doesNotMatch(out, /\bHostElementKey\b/);
        const renamed = out.match(/const (\S+) =/)[1];
        // declaration + computed key + typeof + return = 4 occurrences, all identical.
        const count = (out.match(new RegExp(rx(renamed), 'g')) || []).length;
        assert.equal(count, 4);
    });

    it('preserves member-access property names', () => {
        const out = run(`function f(target) { return target.someProp; }`);
        assertParses(out);
        assert.match(out, /\.someProp\b/);
    });

    it('is idempotent / deterministic', () => {
        const src = `function f() { const aValue = 1; return aValue; }`;
        assert.equal(run(src), run(src));
    });
});
