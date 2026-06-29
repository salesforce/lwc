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

    // GAP C: a private `#` field renames in lockstep across declaration and every `this.#x`
    // access, with the leading `#` preserved. The inner identifier shares a name with a renameable
    // local (constructor param); both rename to the same confusable (transformIdentifier is a pure
    // function of the bare name), and no ASCII occurrence survives.
    it('renames a private class field declaration and access in lockstep, preserving `#`', () => {
        const out = run(
            `class C {\n  #providedContextVarieties;\n` +
                `  constructor(providedContextVarieties) {\n` +
                `    this.#providedContextVarieties = providedContextVarieties;\n  }\n}`
        );
        assertParses(out);
        // No ASCII occurrence of the name survives anywhere (field, access, or param).
        assert.doesNotMatch(out, /providedContextVarieties/);
        // The private declaration and `this.#x` access rename to the same confusable, with `#`.
        const priv = out.match(/#(\S+);/)[1];
        const privCount = (out.match(new RegExp(`#${rx(priv)}`, 'g')) || []).length;
        assert.equal(privCount, 2); // `#field` declaration + `this.#field` access
        // The constructor param renames to the same confusable (pure function of the bare name).
        assert.match(out, new RegExp(`constructor\\(${rx(priv)}\\)`));
    });

    // GAP C: a private `#` method renames at its declaration and every `this.#m()` call site.
    it('renames a private method and its call sites in lockstep', () => {
        const out = run(
            `class C {\n  #computeLayout() { return 1; }\n` +
                `  run() { return this.#computeLayout() + this.#computeLayout(); }\n}`
        );
        assertParses(out);
        assert.doesNotMatch(out, /computeLayout/);
        const m = out.match(/#(\S+)\(\)/)[1];
        const count = (out.match(new RegExp(`#${rx(m)}`, 'g')) || []).length;
        assert.equal(count, 3); // declaration + two call sites
    });

    // GAP C: a private `#x` and a same-named public `obj.x` are independent. The private name
    // renames; the public member access stays ASCII (a preserved member position).
    it('renames a private field without touching a same-named public member access', () => {
        const out = run(
            `class C {\n  #status = 1;\n` + `  sync(obj) { obj.status = this.#status; }\n}`
        );
        assertParses(out);
        // Public member access stays ASCII.
        assert.match(out, /\.status\b/);
        // Private name renamed, `#` preserved, declaration + access in lockstep.
        const priv = out.match(/#(\S+) =/)[1];
        assert.notEqual(priv, 'status');
        const privCount = (out.match(new RegExp(`#${rx(priv)}`, 'g')) || []).length;
        assert.equal(privCount, 2);
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

    // A `const`/`in`/`out` modifier shifts the type-param node's start onto the keyword. The name
    // slice clears the keyword, so the modifier survives intact while the NAME renames in lockstep
    // with its references.
    it('renames a const-modifier type parameter while preserving the keyword', () => {
        const out = run(
            `function f<const T extends readonly unknown[]>(x: T): T {\n  return x;\n}`
        );
        assertParses(out);
        assert.doesNotMatch(out, /\bconst T\b/);
        const renamed = out.match(/<const (\S+) extends/)[1];
        assert.notEqual(renamed, 'T');
        // The `const ` keyword is intact and the name + both references became the same confusable.
        assert.match(out, new RegExp(`<const ${rx(renamed)} extends readonly unknown\\[\\]>`));
        assert.match(out, new RegExp(`\\(\\S+: ${rx(renamed)}\\): ${rx(renamed)}`));
    });

    it('renames an `in` / `out` variance-modified type parameter, keyword intact', () => {
        const inOut = run(`interface Box<in T> {\n  set(v: T): void;\n}`);
        assertParses(inOut);
        assert.doesNotMatch(inOut, /\bin T\b/);
        const inName = inOut.match(/<in (\S+)>/)[1];
        assert.notEqual(inName, 'T');
        assert.match(inOut, new RegExp(`<in ${rx(inName)}>`));
        assert.match(inOut, new RegExp(`set\\(\\S+: ${rx(inName)}\\)`));

        const outOut = run(`interface Box<out T> {\n  get(): T;\n}`);
        assertParses(outOut);
        assert.doesNotMatch(outOut, /\bout T\b/);
        const outName = outOut.match(/<out (\S+)>/)[1];
        assert.notEqual(outName, 'T');
        assert.match(outOut, new RegExp(`<out ${rx(outName)}>`));
        assert.match(outOut, new RegExp(`get\\(\\): ${rx(outName)}`));
    });

    // A single-character name (`n`) inside a `const`-modified param: the keyword-clearing slice
    // must anchor on the whole `const` keyword (\\b + trailing space), never on the `n` inside it.
    it('renames a single-char const-modifier type param without touching the keyword', () => {
        const out = run(`function f<const n>(x: n): n {\n  return x;\n}`);
        assertParses(out);
        const renamed = out.match(/<const (\S+)>/)[1];
        assert.notEqual(renamed, 'n');
        // `const` keyword preserved verbatim; only the param name renamed.
        assert.match(out, new RegExp(`<const ${rx(renamed)}>`));
        assert.match(out, new RegExp(`\\(\\S+: ${rx(renamed)}\\): ${rx(renamed)}`));
    });

    // A name used as a const-modifier param AND as an ordinary (non-const) type parameter elsewhere
    // in the file renames everywhere to the one confusable; the modifier keyword survives.
    it('renames a modifier-shared type-param name across all its occurrences', () => {
        const out = run(
            `interface Box<Value> {\n  v: Value;\n}\n` +
                `function make<const Value = unknown>(x: Value): Box<Value> {\n  return { v: x };\n}`
        );
        assertParses(out);
        assert.doesNotMatch(out, /\bValue\b/);
        const renamed = out.match(/<const (\S+) = unknown>/)[1];
        assert.notEqual(renamed, 'Value');
        // const-modified declaration: keyword intact, name renamed.
        assert.match(out, new RegExp(`<const ${rx(renamed)} = unknown>`));
        // The ordinary declaration's parameter and every reference rename to the same confusable.
        assert.match(out, new RegExp(`<${rx(renamed)}>`));
        assert.match(out, new RegExp(`\\(\\S+: ${rx(renamed)}\\): \\S+<${rx(renamed)}>`));
        assert.match(out, new RegExp(`v: ${rx(renamed)};`));
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

    // A non-exported enum is a file-local dual value+type binding for which Babel registers no
    // scope binding, so it is renamed by a name-keyed path (like a type name). Its members are
    // always reached as `Enum.MEMBER` (a preserved member position), so only the enum name moves.
    it('renames a non-exported enum name across declaration, type, and value positions', () => {
        const out = run(
            `enum TokenType { text = 'text', expr = 'expr' }\n` +
                `interface Tok { type: TokenType; }\n` +
                `function f(t: Tok) {\n` +
                `  if (t.type === TokenType.text) return TokenType.expr;\n` +
                `  return TokenType.text;\n` +
                `}`
        );
        assertParses(out);
        // The enum name renames everywhere to the same confusable.
        assert.doesNotMatch(out, /\bTokenType\b/);
        const renamed = out.match(/enum (\S+) \{/)[1];
        assert.notEqual(renamed, 'TokenType');
        assert.match(out, new RegExp(`type: ${rx(renamed)};`));
        assert.match(out, new RegExp(`=== ${rx(renamed)}\\.text`));
        assert.match(out, new RegExp(`return ${rx(renamed)}\\.expr`));
        // Members stay ASCII: declared as enum-member keys and read via member access.
        assert.match(out, /text = 'text'/);
        assert.match(out, new RegExp(`${rx(renamed)}\\.text`));
        assert.match(out, new RegExp(`${rx(renamed)}\\.expr`));
    });

    // A const enum has no runtime object (TS inlines every `E.Member`), so its member NAMES are
    // compile-time only and rename in lockstep with the key declarations — name and members alike.
    it('renames a non-exported const enum name AND its members in lockstep', () => {
        const out = run(
            `const enum Phase { Start, Stop }\n` +
                `function f(phase: Phase) {\n` +
                `  return phase === Phase.Start ? Phase.Stop : Phase.Start;\n` +
                `}`
        );
        assertParses(out);
        assert.doesNotMatch(out, /\bPhase\b/);
        assert.doesNotMatch(out, /\bStart\b/);
        assert.doesNotMatch(out, /\bStop\b/);
        const renamed = out.match(/const enum (\S+) \{/)[1];
        assert.notEqual(renamed, 'Phase');
        // Capture the renamed member keys from the declaration, then assert each `E.Member` access
        // uses the same confusable (lockstep).
        const [, start, stop] = out.match(/const enum \S+ \{ (\S+), (\S+) \}/);
        assert.notEqual(start, 'Start');
        assert.notEqual(stop, 'Stop');
        assert.match(out, new RegExp(`${rx(renamed)}\\.${rx(start)}`));
        assert.match(out, new RegExp(`${rx(renamed)}\\.${rx(stop)}`));
        assert.match(out, new RegExp(`\\S+: ${rx(renamed)}\\)`));
    });

    // A plain (non-const) enum emits a runtime object with reverse mapping (`E[0] === 'A'`), so its
    // member names are observable strings and must stay ASCII; only the enum name moves.
    it('leaves a plain (non-const) enum members ASCII, renaming only the name', () => {
        const out = run(
            `enum TokenType { text = 'text', expr = 'expr' }\n` +
                `function f(): TokenType { return TokenType.text; }`
        );
        assertParses(out);
        const renamed = out.match(/enum (\S+) \{/)[1];
        assert.notEqual(renamed, 'TokenType');
        // Members stay ASCII in both declaration and access.
        assert.match(out, /text = 'text'/);
        assert.match(out, /expr = 'expr'/);
        assert.match(out, new RegExp(`${rx(renamed)}\\.text`));
    });

    // A const-enum member read by computed string access (`E['Member']`) would desync if the member
    // key renamed, so member renaming is disqualified — members stay ASCII (the name still renames).
    it('keeps const-enum members ASCII when a member is read by computed string access', () => {
        const out = run(
            `const enum Phase { Start, Stop }\n` +
                `const k = 'Start';\n` +
                `const v = Phase[k as 'Start'];\n` +
                `function f(): Phase { return Phase.Start; }`
        );
        assertParses(out);
        const renamed = out.match(/const enum (\S+) \{/)[1];
        assert.notEqual(renamed, 'Phase');
        // Members stay ASCII because of the computed access.
        assert.match(out, /\{ Start, Stop \}/);
        assert.match(out, new RegExp(`${rx(renamed)}\\.Start`));
    });

    // A const-enum member initializer that references a sibling member by bare name (`B = A << 1`)
    // would desync if the keys renamed: the `A` key declaration moves but the bare `A` reference in
    // `B`'s initializer does not. Member renaming is disqualified; the members stay ASCII (the name
    // still renames).
    it('keeps const-enum members ASCII when a member initializer references a sibling member', () => {
        const out = run(
            `const enum Flags { A = 1, B = A << 1 }\n` + `function f(): Flags { return Flags.B; }`
        );
        assertParses(out);
        const renamed = out.match(/const enum (\S+) \{/)[1];
        assert.notEqual(renamed, 'Flags');
        // Members and the sibling reference stay ASCII in lockstep.
        assert.match(out, /A = 1, B = A << 1/);
        assert.match(out, new RegExp(`${rx(renamed)}\\.B`));
    });

    // `keyof typeof E` is the union of the member-key string literals, so renaming the keys would
    // desync any string constrained to that type. Member renaming is disqualified.
    it('keeps const-enum members ASCII when exposed via `keyof typeof`', () => {
        const out = run(
            `const enum Phase { Start, Stop }\n` +
                `const k: keyof typeof Phase = 'Start';\n` +
                `function f(): Phase { return Phase.Start; }`
        );
        assertParses(out);
        const renamed = out.match(/const enum (\S+) \{/)[1];
        assert.notEqual(renamed, 'Phase');
        assert.match(out, /\{ Start, Stop \}/);
        assert.match(out, /'Start'/);
        assert.match(out, new RegExp(`${rx(renamed)}\\.Start`));
    });

    // A const-enum member used as a type (`E.Member`) renames the qualified-name member in lockstep
    // with the key declaration.
    it('renames a const-enum member used in type position', () => {
        const out = run(
            `const enum Phase { Start, Stop }\n` +
                `type OnlyStart = Phase.Start;\n` +
                `function f(p: OnlyStart): Phase { return Phase.Start; }`
        );
        assertParses(out);
        const renamed = out.match(/const enum (\S+) \{/)[1];
        const start = out.match(/const enum \S+ \{ (\S+),/)[1];
        assert.notEqual(start, 'Start');
        // The type reference `Phase.Start` renames both halves in lockstep.
        assert.match(out, new RegExp(`${rx(renamed)}\\.${rx(start)}`));
        assert.doesNotMatch(out, /\bStart\b/);
    });

    // An exported enum is part of the cross-module contract: the analyzer protects its members,
    // and the enum name itself must stay ASCII because it is not collected for renaming (the enum
    // path is name-keyed and only collects non-exported enums).
    it('leaves an exported enum and its members ASCII', () => {
        const out = run(
            `export const enum APIVersion { V1 = 1, V2 = 2 }\n` +
                `function f(v: APIVersion) {\n` +
                `  return v === APIVersion.V1 ? APIVersion.V2 : APIVersion.V1;\n` +
                `}`
        );
        assertParses(out);
        assert.match(out, /export const enum APIVersion \{/);
        assert.match(out, /APIVersion\.V1/);
        assert.match(out, /: APIVersion/);
    });

    // The emit phase renames only `Enum.MEMBER` member access and bare value references; an enum
    // in object shorthand `{ Enum }` is not renamed (the ObjectProperty visitor declines enums),
    // so renaming the declaration would desync. The coverage prescan must drop such an enum and
    // leave it entirely ASCII.
    it('leaves a non-exported enum ASCII when used in object shorthand', () => {
        const out = run(
            `enum TokenType { text = 'text' }\n` +
                `const registry = { TokenType };\n` +
                `function f(): TokenType { return TokenType.text; }`
        );
        assertParses(out);
        assert.match(out, /enum TokenType \{/);
        assert.match(out, /\{ TokenType \}/);
        assert.match(out, /: TokenType/);
        assert.match(out, /TokenType\.text/);
    });

    // An enum re-exported via a separate specifier (`export { Enum }`) has no enum alias at the
    // boundary, so the specifier stays ASCII; renaming the declaration would desync. The prescan
    // must drop it and leave it ASCII.
    it('leaves a non-exported enum ASCII when exported via a separate specifier', () => {
        const out = run(
            `enum TokenType { text = 'text' }\n` +
                `function f(): TokenType { return TokenType.text; }\n` +
                `export { TokenType };`
        );
        assertParses(out);
        assert.match(out, /enum TokenType \{/);
        assert.match(out, /export \{ TokenType \}/);
        assert.match(out, /: TokenType/);
        assert.match(out, /TokenType\.text/);
    });

    it('is idempotent / deterministic', () => {
        const src = `function f() { const aValue = 1; return aValue; }`;
        assert.equal(run(src), run(src));
    });

    // --- TS `private` members of non-exported classes (GAP D) -------------------------------

    // A `private` method of a non-exported class is unreachable outside the class body and lives in
    // no `.d.ts`; the declaration key and every `this.X` access rename in lockstep, `private` intact.
    it('renames a private method of a non-exported class and its this.X access', () => {
        const out = run(
            `class Internal {\n  private callback() { return 1; }\n  run() { return this.callback(); }\n}`
        );
        assertParses(out);
        assert.doesNotMatch(out, /\bcallback\b/);
        const renamed = out.match(/private (\S+)\(\)/)[1];
        assert.notEqual(renamed, 'callback');
        assert.match(out, new RegExp(`private ${rx(renamed)}\\(\\)`));
        assert.match(out, new RegExp(`this\\.${rx(renamed)}\\(\\)`));
        const refs = (out.match(new RegExp(rx(renamed), 'g')) || []).length;
        assert.equal(refs, 2); // declaration + one access
    });

    it('renames a private field of a non-exported class and its this.X read', () => {
        const out = run(
            `class Internal {\n  private count = 0;\n  read() { return this.count; }\n}`
        );
        assertParses(out);
        assert.doesNotMatch(out, /\bcount\b/);
        const renamed = out.match(/private (\S+) =/)[1];
        assert.match(out, new RegExp(`this\\.${rx(renamed)}\\b`));
    });

    // `const { X } = this` shorthand: key and the introduced binding are one source token, so a
    // single rename covers the destructured key, the binding, and its later reference.
    it('renames a private member destructured via `const {X}=this` shorthand in lockstep', () => {
        const out = run(
            `class Internal {\n  private callback = () => 1;\n  run() {\n    const { callback } = this;\n    return callback();\n  }\n}`
        );
        assertParses(out);
        assert.doesNotMatch(out, /\bcallback\b/);
        const renamed = out.match(/private (\S+) =/)[1];
        // The destructuring stays shorthand (one token) — no `callback: X` expansion stranding it.
        assert.match(out, new RegExp(`const \\{ ${rx(renamed)} \\} = this`));
        assert.match(out, new RegExp(`return ${rx(renamed)}\\(\\)`));
    });

    // A public member of an exported class stays ASCII (cross-module contract) while a distinct
    // private member of an internal class renames — the two are independent.
    it('leaves an exported class member ASCII while renaming an internal private member', () => {
        const out = run(
            `export class Public {\n  publicFn() { return this.publicFn; }\n}\n` +
                `class Internal {\n  private secret() { return 1; }\n  run() { return this.secret(); }\n}`
        );
        assertParses(out);
        // Exported class member preserved (template/cross-module contract).
        assert.match(out, /\bpublicFn\(\) \{ return this\.publicFn; \}/);
        // Internal private member renamed in lockstep.
        assert.doesNotMatch(out, /\bsecret\b/);
        const renamed = out.match(/private (\S+)\(\)/)[1];
        assert.match(out, new RegExp(`this\\.${rx(renamed)}\\(\\)`));
    });

    // A name shared with an exported class member is excluded from the internal scoped set
    // (`publicIdentifiers` is name-keyed and file-global), so it stays ASCII everywhere — the
    // conservative choice when a private name collides with a public contract name.
    it('leaves an internal private member ASCII when its name collides with an exported member', () => {
        const out = run(
            `export class Public {\n  callback() { return this.callback; }\n}\n` +
                `class Internal {\n  private callback() { return 1; }\n  run() { return this.callback(); }\n}`
        );
        assertParses(out);
        assert.match(out, /\bcallback\(\) \{ return this\.callback; \}/);
        assert.match(out, /private callback\(\)/);
        assert.match(out, /return this\.callback\(\)/);
    });

    // A same-named access on a different object (`other.callback`) inside the class is NOT a
    // `this.X` access, so it cannot be proven to be the private member — the prescan drops the
    // member, leaving it ASCII everywhere to stay lockstep-safe.
    it('drops a private member when a same-name access occurs on a non-this object', () => {
        const out = run(
            `class Internal {\n  private callback() { return 1; }\n  run(other: any) { return other.callback; }\n}`
        );
        assertParses(out);
        // The member is dropped, so its name stays ASCII at the decl and at the `.callback` access.
        assert.match(out, /private callback\(\)/);
        assert.match(out, /\.callback\b/);
    });

    // A computed `this['callback']` exposes the member name as a string literal, so the prescan's
    // string-literal drop fires and the member stays ASCII everywhere (decl + `this.callback`).
    it('drops a private member read by computed this[...] string access', () => {
        const out = run(
            `class Internal {\n  private callback() { return 1; }\n  run() { return this['callback'] === this.callback; }\n}`
        );
        assertParses(out);
        assert.match(out, /private callback\(\)/);
        assert.match(out, /this\['callback'\]/);
        assert.match(out, /this\.callback/);
    });

    it('drops a private member exposed as a string literal inside the class', () => {
        const out = run(
            `class Internal {\n  private callback() { return 1; }\n  run() { return 'callback' in this; }\n}`
        );
        assertParses(out);
        assert.match(out, /private callback\(\)/);
        assert.match(out, /'callback' in this/);
    });

    // Two non-exported classes each declaring `private callback`: node-scoped, so each renames
    // independently — and because the mapping is deterministic, both land on the same confusable.
    it('renames same-named private members of two internal classes independently', () => {
        const out = run(
            `class A {\n  private callback() { return 1; }\n  run() { return this.callback(); }\n}\n` +
                `class B {\n  private callback() { return 2; }\n  go() { return this.callback(); }\n}`
        );
        assertParses(out);
        assert.doesNotMatch(out, /\bcallback\b/);
        const renamed = out.match(/private (\S+)\(\)/)[1];
        const decls = (out.match(/private (\S+)\(\)/g) || []).length;
        assert.equal(decls, 2);
        assert.match(out, new RegExp(`this\\.${rx(renamed)}\\(\\)`));
    });

    // A class exported via a separate specifier (`export { Klass }`) is in `exportedClassLocals`,
    // so its private members are treated as a potential contract and left ASCII.
    it('leaves private members of a specifier-exported class ASCII', () => {
        const out = run(
            `class Klass {\n  private callback() { return 1; }\n  run() { return this.callback(); }\n}\n` +
                `export { Klass };`
        );
        assertParses(out);
        assert.match(out, /private callback\(\)/);
        assert.match(out, /this\.callback\(\)/);
    });

    it('is idempotent on a non-exported class private member', () => {
        const src = `class Internal {\n  private callback() { return 1; }\n  run() { return this.callback(); }\n}`;
        assert.equal(run(src), run(src));
    });

    // A non-arrow `function () {}` rebinds `this` at call time, so a `this.X` inside it does NOT
    // reference the class instance. The member must NOT rename through that access; the prescan
    // sees an uncovered occurrence and drops the member, leaving it ASCII everywhere (lockstep-safe).
    it('drops a private member accessed via this inside a nested non-arrow function', () => {
        const out = run(
            `class Internal {\n  private callback() { return 1; }\n  run() {\n    const fn = function () { return this.callback(); };\n    return fn.call(this) + this.callback();\n  }\n}`
        );
        assertParses(out);
        // The ambiguous rebinding-`this` access forces the whole member ASCII (decl + both accesses)
        // — renaming the declaration while that access cannot follow would desync at runtime.
        assert.match(out, /private callback\(\)/);
        const accesses = (out.match(/this\.callback\(\)/g) || []).length;
        assert.equal(accesses, 2);
    });

    // An arrow function preserves the lexical (instance) `this`, so `this.X` inside it IS a member
    // access and renames in lockstep with the declaration.
    it('renames a private member accessed via this inside a nested arrow function', () => {
        const out = run(
            `class Internal {\n  private callback() { return 1; }\n  run() {\n    const fn = () => this.callback();\n    return fn() + this.callback();\n  }\n}`
        );
        assertParses(out);
        assert.doesNotMatch(out, /\bcallback\b/);
        const renamed = out.match(/private (\S+)\(\)/)[1];
        const accesses = (out.match(new RegExp(`this\\.${rx(renamed)}\\(\\)`, 'g')) || []).length;
        assert.equal(accesses, 2);
    });
});
