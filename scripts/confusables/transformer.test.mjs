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

    it('restructures an inline exported function into renamed decl + aliased export', () => {
        const out = run(`export function publicFn(internalArg) {\n  return internalArg;\n}`);
        assertParses(out);
        // `export ` stripped; declaration renamed; aliased export preserves the name.
        assert.doesNotMatch(out, /export function publicFn/);
        const renamed = out.match(/function (\S+)\(/)[1];
        assert.notEqual(renamed, 'publicFn');
        assert.match(out, new RegExp(`export \\{ ${rx(renamed)} as publicFn \\};`));
        assert.doesNotMatch(out, /\binternalArg\b/);
    });

    it('restructures an inline exported const into renamed decl + aliased export', () => {
        const out = run(`export const MY_CONST = 42;`);
        assertParses(out);
        assert.doesNotMatch(out, /export const MY_CONST/);
        const renamed = out.match(/const (\S+) = 42;/)[1];
        assert.match(out, new RegExp(`export \\{ ${rx(renamed)} as MY_CONST \\};`));
    });

    it('rewrites a multi-declarator export with one aliased specifier list', () => {
        const out = run(`export const A = 1, B = 2;`);
        assertParses(out);
        assert.doesNotMatch(out, /export const A/);
        const rA = out.match(/const (\S+) = 1/)[1];
        const rB = out.match(/, (\S+) = 2/)[1];
        assert.match(out, new RegExp(`export \\{ ${rx(rA)} as A, ${rx(rB)} as B \\};`));
    });

    it('rewrites an export specifier list, aliasing each local', () => {
        const out = run(`const foo = 1;\nconst bar = 2;\nexport { foo, bar };`);
        assertParses(out);
        const rFoo = out.match(/const (\S+) = 1;/)[1];
        const rBar = out.match(/const (\S+) = 2;/)[1];
        assert.match(out, new RegExp(`export \\{ ${rx(rFoo)} as foo, ${rx(rBar)} as bar \\};`));
    });

    it('rewrites an already-aliased export specifier, keeping the public name', () => {
        const out = run(`const foo = 1;\nexport { foo as Pub };`);
        assertParses(out);
        const rFoo = out.match(/const (\S+) = 1;/)[1];
        assert.match(out, new RegExp(`export \\{ ${rx(rFoo)} as Pub \\};`));
    });

    // Overloaded exported function: signatures are TSDeclareFunction, implementation is a
    // FunctionDeclaration. All must agree on `export`, so each signature is stripped and only the
    // implementation emits the aliased re-export.
    it('strips export from overload signatures, exporting the implementation once', () => {
        const out = run(
            `export function foo(a: string): void;\n` +
                `export function foo(a: number): void;\n` +
                `export function foo(a: any) { return a; }`
        );
        assertParses(out);
        assert.doesNotMatch(out, /export function/);
        const renamed = out.match(/function (\S+)\(a: string\): void;/)[1];
        // All three declarations (2 signatures + implementation) use the same renamed id.
        const declCount = (out.match(new RegExp(`function ${rx(renamed)}\\(`, 'g')) || []).length;
        assert.equal(declCount, 3);
        const exportCount = (out.match(/ as foo \}/g) || []).length;
        assert.equal(exportCount, 1);
    });

    // `typeof X` where X is a type-only import of a value: the import local is renamed via
    // aliasing, so the type query must match.
    it('renames a typeof query referencing a type-only import', () => {
        const out = run(`import type { Dirs } from './d';\n` + `let s: Set<keyof typeof Dirs>;`);
        assertParses(out);
        const renamed = out.match(/import type \{ Dirs as (\S+) \}/)[1];
        assert.match(out, new RegExp(`typeof ${rx(renamed)}`));
        assert.doesNotMatch(out, /typeof Dirs/);
    });

    it('renames a default-exported function id with no alias', () => {
        const out = run(`export default function foo() { return 1; }`);
        assertParses(out);
        assert.match(out, /export default function (\S+)\(\)/);
        const renamed = out.match(/export default function (\S+)\(\)/)[1];
        assert.notEqual(renamed, 'foo');
    });

    it('leaves an anonymous default export untouched', () => {
        const out = run(`export default function () { return 1; }`);
        assertParses(out);
        assert.match(out, /export default function \(\)/);
    });

    // Value+type declaration merge (`export const X` + `export type X`): the value specifier
    // already re-exports both meanings, so the type half must NOT emit a second re-export.
    it('exports a value+type declaration merge only once', () => {
        const out = run(
            `export const Metrics = { a: 1 } as const;\n` +
                `export type Metrics = (typeof Metrics)[keyof typeof Metrics];\n` +
                `let v: Metrics;`
        );
        assertParses(out);
        const exportCount = (out.match(/ as Metrics \}/g) || []).length;
        assert.equal(exportCount, 1);
        const renamed = out.match(/const (\S+) = \{/)[1];
        assert.match(out, new RegExp(`export \\{ ${rx(renamed)} as Metrics \\};`));
        // The type half is stripped to a local declaration (no `export`).
        assert.doesNotMatch(out, /export type/);
    });

    it('restructures an exported interface with a type-aliased export', () => {
        const out = run(`export interface Shape {\n  width: number;\n}`);
        assertParses(out);
        assert.doesNotMatch(out, /export interface Shape/);
        const renamed = out.match(/interface (\S+) \{/)[1];
        assert.match(out, new RegExp(`export \\{ type ${rx(renamed)} as Shape \\};`));
        // Structural member preserved.
        assert.match(out, /\bwidth\b/);
    });

    it('renames a named import via aliasing, preserving the import string contract', () => {
        const out = run(`import { thing } from 'x';\nfunction f() { return thing; }`);
        assertParses(out);
        // External name `thing` preserved at the boundary; local renamed and referenced.
        assert.match(out, /import \{ thing as (\S+) \} from 'x';/);
        const renamed = out.match(/import \{ thing as (\S+) \}/)[1];
        assert.match(out, new RegExp(`return ${rx(renamed)};`));
        assert.doesNotMatch(out, /return thing;/);
    });

    it('renames a default import with no alias (contract is `default`)', () => {
        const out = run(`import thing from 'x';\nfunction f() { return thing; }`);
        assertParses(out);
        const renamed = out.match(/import (\S+) from 'x';/)[1];
        assert.notEqual(renamed, 'thing');
        assert.match(out, new RegExp(`return ${rx(renamed)};`));
    });

    it('renames the local of an aliased import, leaving the imported name ASCII', () => {
        const out = run(`import { foo as bar } from 'x';\nfunction f() { return bar; }`);
        assertParses(out);
        assert.match(out, /import \{ foo as (\S+) \} from 'x';/);
        assert.doesNotMatch(out, /\bbar\b/);
    });

    it('renames a namespace import local, preserving member access', () => {
        const out = run(`import * as NS from 'x';\nfunction f() { return NS.member; }`);
        assertParses(out);
        const renamed = out.match(/import \* as (\S+) from 'x';/)[1];
        assert.notEqual(renamed, 'NS');
        assert.match(out, new RegExp(`${rx(renamed)}\\.member`));
    });

    it('leaves re-exports untouched (no local binding)', () => {
        const out = run(`export { foo } from 'x';\nexport * from 'y';\nexport * as NS from 'z';`);
        assertParses(out);
        assert.match(out, /export \{ foo \} from 'x';/);
        assert.match(out, /export \* from 'y';/);
        assert.match(out, /export \* as NS from 'z';/);
    });

    // `import type` bindings live in type space; they are renamed via aliasing too.
    it('renames type-only imports via aliasing and rewrites their type references', () => {
        const out = run(`import type { Foo } from 'x';\nlet v: Foo;`);
        assertParses(out);
        assert.match(out, /import type \{ Foo as (\S+) \} from 'x';/);
        const renamed = out.match(/import type \{ Foo as (\S+) \}/)[1];
        assert.match(out, new RegExp(`: ${rx(renamed)};`));
        assert.doesNotMatch(out, /: Foo;/);
    });

    it('preserves implicit globals (no resolvable binding)', () => {
        const out = run(`function f(n) { return isFinite(n) && parseInt(String(n)); }`);
        assertParses(out);
        assert.match(out, /\bisFinite\b/);
        assert.match(out, /\bparseInt\b/);
        assert.match(out, /\bString\b/);
        assert.doesNotMatch(out, /\bn\b/); // param renamed
    });

    // Type alias + references rename together (declaration and reference stay in sync).
    it('renames a local type alias and all its references in lockstep', () => {
        const out = run(
            `type BaseArray = readonly unknown[];\nfunction f(x: BaseArray): BaseArray { return x; }`
        );
        assertParses(out);
        assert.doesNotMatch(out, /\bBaseArray\b/);
        const renamed = out.match(/type (\S+) =/)[1];
        const count = (out.match(new RegExp(rx(renamed), 'g')) || []).length;
        assert.equal(count, 3); // declaration + param type + return type
    });

    // The mapped-type constraint (`K in Keys`) is a TSTypeReference position, so the referenced
    // type renames in lockstep; the mapped key `K` is itself a type parameter and also renames.
    it('renames a type referenced from a mapped-type constraint in lockstep', () => {
        const out = run(`type Keys = 'a' | 'b';\ntype M = { [K in Keys]: number };`);
        assertParses(out);
        assert.doesNotMatch(out, /\bKeys\b/);
        assert.doesNotMatch(out, /\bK\b/);
        const renamed = out.match(/type (\S+) = 'a'/)[1];
        const k = out.match(/\[([^ ]+) in /)[1];
        assert.match(out, new RegExp(`\\[${rx(k)} in ${rx(renamed)}\\]`));
    });

    // A type parameter and a same-named outer type both rename. The deterministic mapping sends
    // every `T` to the same confusable, so the declaration and all references stay in lockstep.
    it('renames a type parameter and a same-named outer type to the same confusable', () => {
        const out = run(`type T = number;\nfunction f<T>(x: T): T { return x; }`);
        assertParses(out);
        assert.doesNotMatch(out, /\bT\b/);
        // <param>, x: <param>, : <param> all share one token; the outer `type T` shares it too.
        const param = out.match(/function \S+<([^>]+)>/)[1];
        assert.notEqual(param, 'T');
        assert.match(
            out,
            new RegExp(`function \\S+<${rx(param)}>\\(\\S+: ${rx(param)}\\): ${rx(param)}`)
        );
        assert.match(out, new RegExp(`type ${rx(param)} = number;`));
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

    // Exported destructuring locals: each binding renames (with key kept ASCII) and the export
    // name is preserved via an aliased specifier list.
    it('renames exported destructuring locals with an aliased export specifier list', () => {
        const out = run(`const _N = {};\nexport const { ELEMENT_NODE, TEXT_NODE } = _N;`);
        assertParses(out);
        assert.doesNotMatch(out, /export const \{ ELEMENT_NODE, TEXT_NODE \}/);
        const rEl = out.match(/ELEMENT_NODE: (\S+),/)[1];
        const rTx = out.match(/TEXT_NODE: (\S+) \}/)[1];
        assert.match(
            out,
            new RegExp(`export \\{ ${rx(rEl)} as ELEMENT_NODE, ${rx(rTx)} as TEXT_NODE \\};`)
        );
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

    // A value parameter shares a name with a type parameter (estemplate.ts
    // `...Validators: Validators`). The value binding and the type parameter are independent
    // namespaces but map to the same confusable deterministically, so every occurrence renames
    // to one identical token — value param, type-param declaration, and all type references.
    it('renames a type parameter that collides with a renameable value name in lockstep', () => {
        const out = run(
            `function g<Validators extends unknown[]>(\n` +
                `  ...Validators: Validators\n` +
                `): Wrap<Validators> {\n  return Validators as any;\n}`
        );
        assertParses(out);
        assert.doesNotMatch(out, /\bValidators\b/);
        const renamed = out.match(/<([^ ]+) extends unknown\[\]>/)[1];
        assert.notEqual(renamed, 'Validators');
        // Type-param declaration, parameter annotation, and the Wrap<...> reference all match.
        assert.match(out, new RegExp(`<${rx(renamed)} extends unknown\\[\\]>`));
        assert.match(out, new RegExp(`: ${rx(renamed)}\\n`));
        assert.match(out, new RegExp(`Wrap<${rx(renamed)}>`));
        // `Wrap` is unresolved (no binding), so it stays ASCII.
        assert.match(out, /\bWrap\b/);
    });

    // Bug class: computed type-member key references a renamed value binding (node-ownership.ts).
    // A computed type-member key referencing a type-only import must rename in lockstep with the
    // aliased import local (the import is not a value binding).
    it('renames a computed type-member key referencing a type-only import', () => {
        const out = run(
            `import type { KEY } from './keys';\n` + `interface I {\n  [KEY]?: boolean;\n}`
        );
        assertParses(out);
        const renamed = out.match(/import type \{ KEY as (\S+) \}/)[1];
        assert.match(out, new RegExp(`\\[${rx(renamed)}\\]\\?: boolean;`));
    });

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

    // --- Type-parameter renaming (GAP B) ----------------------------------------------------

    it('renames a simple type parameter and its references in lockstep', () => {
        const out = run(`function track<T>(target: T): T {\n  return target;\n}`);
        assertParses(out);
        assert.doesNotMatch(out, /\bT\b/);
        const param = out.match(/function \S+<([^>]+)>/)[1];
        assert.notEqual(param, 'T');
        // declaration + param annotation + return annotation = 3 occurrences, all identical.
        const count = (out.match(new RegExp(rx(param), 'g')) || []).length;
        assert.equal(count, 3);
    });

    it('renames a constrained type parameter, preserving the constraint type', () => {
        const out = run(
            `function safeHasProp<K extends PropertyKey>(prop: K): prop is Record<K, unknown> {\n  return true;\n}`
        );
        assertParses(out);
        assert.doesNotMatch(out, /\bK\b/);
        const param = out.match(/<([^ ]+) extends PropertyKey>/)[1];
        assert.match(out, new RegExp(`<${rx(param)} extends PropertyKey>`));
        assert.match(out, new RegExp(`Record<${rx(param)}, unknown>`));
        // The `extends` keyword and the constraint type are preserved.
        assert.match(out, /\bextends PropertyKey\b/);
    });

    it('renames defaulted type parameters, preserving the default types', () => {
        const out = run(`interface VM<N = HostNode, E = HostElement> {\n  n: N;\n  e: E;\n}`);
        assertParses(out);
        // `E` always maps to a non-ASCII confusable; assert it renames in lockstep.
        const e = out.match(/, ([^ ]+) = HostElement>/)[1];
        assert.notEqual(e, 'E');
        assert.match(out, new RegExp(`${rx(e)} = HostElement>`));
        assert.match(out, new RegExp(`e: ${rx(e)};`));
        // Default types (undeclared, no binding) stay ASCII.
        assert.match(out, /= HostNode/);
        assert.match(out, /= HostElement/);
    });

    it('renames a mapped-type key parameter and the iterated type in lockstep', () => {
        const out = run(`type Req<T> = { [P in keyof T]-?: Wrap<T[P]> };`);
        assertParses(out);
        assert.doesNotMatch(out, /\bP\b/);
        assert.doesNotMatch(out, /\bT\b/);
        const p = out.match(/\[([^ ]+) in keyof/)[1];
        const t = out.match(/keyof ([^\]]+)\]/)[1];
        // `P` appears in the key and the indexed access; `T` in keyof and the indexed access.
        assert.match(
            out,
            new RegExp(`\\[${rx(p)} in keyof ${rx(t)}\\]-\\?: Wrap<${rx(t)}\\[${rx(p)}\\]>`)
        );
    });

    it('renames an infer type variable and its reference in lockstep', () => {
        const out = run(`type Unbox<T> = T extends Box<infer Inner> ? Inner : never;`);
        assertParses(out);
        assert.doesNotMatch(out, /\bInner\b/);
        const inf = out.match(/infer ([^>]+)>/)[1];
        assert.notEqual(inf, 'Inner');
        assert.match(out, new RegExp(`infer ${rx(inf)}> \\? ${rx(inf)} :`));
        // The conditional structure and the unresolved `Box` are preserved.
        assert.match(out, /\bextends Box</);
    });

    it('renames a template-literal infer variable in lockstep', () => {
        const out = run(
            'type Aria<Prop> = Prop extends `aria${infer S}` ? `aria-${Lowercase<S>}` : Prop;'
        );
        assertParses(out);
        const s = out.match(/infer ([^}]+)}/)[1];
        assert.notEqual(s, 'S');
        assert.match(out, new RegExp(`Lowercase<${rx(s)}>`));
        // `Lowercase` is a global utility type and stays ASCII.
        assert.match(out, /\bLowercase</);
    });

    it('renames type parameters in a mapped type over a discriminant with nested infer', () => {
        const src =
            `type Pick2<T extends { type: string }> = {\n` +
            `  [K in T['type']]: T extends { type: K } ? T : never;\n` +
            `};`;
        const out = run(src);
        assertParses(out);
        // Deterministic: a second run over the same source is byte-identical.
        assert.equal(run(src), out);
        const k = out.match(/\[([^ ]+) in /)[1];
        assert.match(out, new RegExp(`\\[${rx(k)} in `));
        // `K` recurs inside the conditional's `{ type: K }` and renames in lockstep.
        assert.match(out, new RegExp(`type: ${rx(k)} }`));
    });

    it('is idempotent over a generic declaration', () => {
        const src = `function id<T>(x: T): T { return x; }`;
        assert.equal(run(src), run(src));
    });

    // A `const` (or `in`/`out`) modifier shifts the type-param node's start onto the keyword, so
    // the name slice would corrupt it — such params are left ASCII (declaration and references).
    it('leaves a const-modifier type parameter ASCII to avoid corrupting the keyword', () => {
        const out = run(
            `function f<const T extends readonly unknown[]>(x: T): T {\n  return x;\n}`
        );
        assertParses(out);
        assert.match(out, /<const T extends readonly unknown\[\]>/);
        // References stay ASCII in lockstep with the preserved declaration.
        assert.match(out, /\(\S+: T\): T/);
    });

    // Regression for wire.ts/errors.ts: a name used as a const-modifier param AND as an ordinary
    // (non-const) type parameter elsewhere in the file. The ordinary occurrence would otherwise
    // pull the name into the rename set, and emitting on the const-modified declaration slices at
    // the modifier keyword — corrupting `const` into a doubled token. The whole name must stay
    // ASCII (every declaration and reference) when any declaration carries a modifier.
    it('leaves a modifier-shared type-param name ASCII across all its occurrences', () => {
        const out = run(
            `interface Box<Value> {\n  v: Value;\n}\n` +
                `function make<const Value = unknown>(x: Value): Box<Value> {\n  return { v: x };\n}`
        );
        assertParses(out);
        // const-modified declaration: keyword intact, name untouched.
        assert.match(out, /<const Value = unknown>/);
        // The ordinary declaration's parameter and every `Value` reference also stay ASCII — no
        // desync. (`Box`/`make`/`x` rename freely; only `Value` is forced ASCII by the modifier.)
        assert.match(out, /interface \S+<Value>/);
        assert.match(out, /\(\S+: Value\): \S+<Value>/);
        assert.match(out, /v: Value;/);
        assert.doesNotMatch(out, /Value\s+Value/);
    });

    // --- Common-property-name local renaming (GAP A) ----------------------------------------

    // `error` (and the other former "common property" names) are no longer globally preserved, so
    // a local binding named `error` renames while `.error` member access stays ASCII.
    it('renames a local named `error`, preserving `.error` / `.message` member access', () => {
        const out = run(
            `function f(obj) {\n  try {\n    return obj.error;\n  } catch (error) {\n    return error.message;\n  }\n}`
        );
        assertParses(out);
        // Member-access names are preserved regardless of the renamed locals.
        assert.match(out, /\.error\b/);
        assert.match(out, /\.message\b/);
        // The catch binding is renamed, and its use is renamed in lockstep.
        assert.doesNotMatch(out, /catch \(error\)/);
        const renamed = out.match(/catch \((\S+)\)/)[1];
        assert.notEqual(renamed, 'error');
        assert.match(out, new RegExp(`${rx(renamed)}\\.message`));
    });

    // A catch-clause shorthand destructuring binding (`catch ({ message })`) is registered in the
    // scope but not resolvable via `getBinding` from the declaration path. The reference renames,
    // so the binding must expand to a non-shorthand key in lockstep — never leave the key ASCII
    // while the reference renames (that produced a TS2304 build failure).
    it('expands a catch-clause shorthand destructuring binding in lockstep with its reference', () => {
        const out = run(
            `const x = (() => {\n  try {\n    foo();\n  } catch ({ message }) {\n    return message;\n  }\n  return '';\n})();`
        );
        assertParses(out);
        const renamed = out.match(/catch \(\{ message: (\S+) \}\)/)[1];
        assert.notEqual(renamed, 'message');
        // The reference renames to the same token — no dangling ASCII `message` reference.
        assert.match(out, new RegExp(`return ${rx(renamed)};`));
    });

    it('is idempotent / deterministic', () => {
        const src = `function f() { const aValue = 1; return aValue; }`;
        assert.equal(run(src), run(src));
    });
});
