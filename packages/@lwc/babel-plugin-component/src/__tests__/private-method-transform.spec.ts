/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, expect, test } from 'vitest';
import { transformSync } from '@babel/core';
import plugin, { LwcPrivateMethodTransform, LwcReversePrivateMethodTransform } from '../index';

const BASE_OPTS = {
    namespace: 'lwc',
    name: 'test',
};

const BASE_CONFIG = {
    babelrc: false,
    configFile: false,
    filename: 'test.js',
    compact: false,
};

function transformWithFullPipeline(source: string, opts = {}) {
    return transformSync(source, {
        ...BASE_CONFIG,
        plugins: [
            LwcPrivateMethodTransform,
            [plugin, { ...BASE_OPTS, ...opts }],
            LwcReversePrivateMethodTransform,
        ],
    })!;
}

function transformReverseOnly(source: string) {
    return transformSync(source, {
        ...BASE_CONFIG,
        plugins: [LwcReversePrivateMethodTransform],
    })!;
}

function transformForwardOnly(source: string, opts = {}) {
    return transformSync(source, {
        ...BASE_CONFIG,
        plugins: [LwcPrivateMethodTransform, [plugin, { ...BASE_OPTS, ...opts }]],
    })!;
}

describe('private method transform validation', () => {
    test('normal private methods round-trip successfully', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #privateMethod() {
                    return 42;
                }
            }
        `;

        const result = transformWithFullPipeline(source);
        expect(result.code).toContain('#privateMethod');
        expect(result.code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('multiple private methods round-trip successfully', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #methodA() { return 1; }
                #methodB() { return 2; }
                #methodC() { return 3; }
            }
        `;

        const result = transformWithFullPipeline(source);
        expect(result.code).toContain('#methodA');
        expect(result.code).toContain('#methodB');
        expect(result.code).toContain('#methodC');
    });

    test('throws error when user-defined method collides with reserved prefix', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                __lwc_component_class_internal_private_sneakyMethod() {
                    return 'collision';
                }
            }
        `;

        expect(() => transformWithFullPipeline(source)).toThrowError(
            /cannot start with reserved prefix `__lwc_`\. Please rename this function to avoid conflict/
        );
    });

    test('throws error when collision exists alongside real private methods', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #realPrivate() { return 1; }
                __lwc_component_class_internal_private_fakePrivate() {
                    return 'collision';
                }
            }
        `;

        expect(() => transformWithFullPipeline(source)).toThrowError(
            /cannot start with reserved prefix `__lwc_`\. Please rename this function to avoid conflict/
        );
    });

    test('does not flag methods that do not use the reserved prefix', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #privateMethod() { return 1; }
                normalPublicMethod() { return 2; }
                _underscoreMethod() { return 3; }
            }
        `;

        const result = transformWithFullPipeline(source);
        expect(result.code).toContain('#privateMethod');
        expect(result.code).toContain('normalPublicMethod');
        expect(result.code).toContain('_underscoreMethod');
    });

    test('async private method round-trips successfully', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                async #fetchData() {
                    return await Promise.resolve(42);
                }
            }
        `;

        const result = transformWithFullPipeline(source);
        expect(result.code).toContain('async #fetchData');
        expect(result.code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('static private method round-trips successfully', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                static #helper() {
                    return 'static';
                }
            }
        `;

        const result = transformWithFullPipeline(source);
        expect(result.code).toContain('static #helper');
        expect(result.code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('private method with parameters round-trips successfully', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #compute(a, b, ...rest) {
                    return a + b + rest.length;
                }
            }
        `;

        const result = transformWithFullPipeline(source);
        expect(result.code).toContain('#compute(a, b, ...rest)');
        expect(result.code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('private getter throws unsupported error', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                get #value() {
                    return this._val;
                }
            }
        `;

        expect(() => transformWithFullPipeline(source)).toThrowError(
            /Private accessor methods are not currently supported\. Only private methods are supported\./
        );
    });

    test('private setter throws unsupported error', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                set #value(v) {
                    this._val = v;
                }
            }
        `;

        expect(() => transformWithFullPipeline(source)).toThrowError(
            /Private accessor methods are not currently supported\. Only private methods are supported\./
        );
    });

    test('decorated private method throws', () => {
        const source = `
            import { LightningElement, api } from 'lwc';
            export default class Test extends LightningElement {
                @api #decorated() {
                    return 1;
                }
            }
        `;

        // The forward private method transform runs as a separate plugin before the
        // main LWC plugin, so LWC1212 fires before the @api decorator validation.
        expect(() => transformWithFullPipeline(source)).toThrowError(
            /Decorators cannot be applied to private methods/
        );
    });

    test('class with zero private methods succeeds', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                publicMethod() { return 1; }
                anotherPublic() { return 2; }
            }
        `;

        const result = transformWithFullPipeline(source);
        expect(result.code).toContain('publicMethod');
        expect(result.code).toContain('anotherPublic');
        expect(result.code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('error message includes the specific offending method name', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                __lwc_component_class_internal_private_mySpecificName() {
                    return 'collision';
                }
            }
        `;

        expect(() => transformWithFullPipeline(source)).toThrowError(
            /__lwc_component_class_internal_private_mySpecificName/
        );
    });

    test('multiple collision methods throws on first encountered', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                __lwc_component_class_internal_private_collisionA() { return 1; }
                __lwc_component_class_internal_private_collisionB() { return 2; }
            }
        `;

        expect(() => transformWithFullPipeline(source)).toThrowError(
            /__lwc_component_class_internal_private_collision[AB]/
        );
    });

    test('generator private method round-trips successfully', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                *#generate() {
                    yield 1;
                    yield 2;
                }
            }
        `;

        const result = transformWithFullPipeline(source);
        expect(result.code).toContain('#generate');
        expect(result.code).toContain('yield');
        expect(result.code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('reverse standalone on clean code succeeds without forward metadata', () => {
        const source = `
            class Test {
                publicMethod() { return 1; }
            }
        `;

        const result = transformReverseOnly(source);
        expect(result.code).toContain('publicMethod');
    });

    test('reverse standalone with prefixed method throws collision when metadata is missing', () => {
        const source = `
            class Test {
                __lwc_component_class_internal_private_foo() { return 1; }
            }
        `;

        expect(() => transformReverseOnly(source)).toThrowError(
            /cannot start with reserved prefix `__lwc_`\. Please rename this function to avoid conflict/
        );
    });

    test('Program.exit count mismatch throws when forward-transformed method is removed', () => {
        const PREFIX = '__lwc_component_class_internal_private_';

        // Custom Babel plugin that removes methods with the private prefix,
        // simulating an intermediate plugin that drops a method between
        // the forward and reverse transforms.
        function methodRemoverPlugin(): { visitor: { ClassMethod: (path: any) => void } } {
            return {
                visitor: {
                    ClassMethod(path: any) {
                        const key = path.get('key');
                        if (key.isIdentifier() && key.node.name.startsWith(PREFIX)) {
                            path.remove();
                        }
                    },
                },
            };
        }

        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #disappearingMethod() { return 1; }
            }
        `;

        expect(() =>
            transformSync(source, {
                ...BASE_CONFIG,
                plugins: [
                    LwcPrivateMethodTransform,
                    [plugin, { ...BASE_OPTS }],
                    methodRemoverPlugin,
                    LwcReversePrivateMethodTransform,
                ],
            })
        ).toThrowError(/Private method transform count mismatch/);
    });

    test('multiple classes in the same file round-trip private methods', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class First extends LightningElement {
                #shared() { return 'first'; }
            }
            class Second extends LightningElement {
                #shared() { return 'second'; }
            }
        `;

        const result = transformWithFullPipeline(source);
        expect(result.code).not.toContain('__lwc_component_class_internal_private_');
        const matches = result.code!.match(/#shared/g);
        expect(matches).toHaveLength(2);
    });

    test('private method body with call sites round-trips', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #helper() { return 42; }
                #caller() {
                    return this.#helper() + 1;
                }
            }
        `;

        const result = transformWithFullPipeline(source);
        expect(result.code).toContain('#helper');
        expect(result.code).toContain('#caller');
        expect(result.code).toContain('this.#helper()');
        expect(result.code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('forward-only output contains correct prefixed names', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #foo() { return 1; }
                #bar() { return 2; }
            }
        `;

        const result = transformForwardOnly(source);
        expect(result.code).toContain('__lwc_component_class_internal_private_foo');
        expect(result.code).toContain('__lwc_component_class_internal_private_bar');
        expect(result.code).not.toContain('#foo');
        expect(result.code).not.toContain('#bar');
    });

    test('combined flags (static, async, default param) survive round-trip', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                static async #fetch(url, opts = {}) {
                    return await fetch(url, opts);
                }
            }
        `;

        const result = transformWithFullPipeline(source);
        expect(result.code).toContain('static async #fetch(url, opts = {})');
        expect(result.code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('method ordering is preserved through round-trip', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #alpha() { return 'a'; }
                publicBeta() { return 'b'; }
                #gamma() { return 'c'; }
                publicDelta() { return 'd'; }
            }
        `;

        const result = transformWithFullPipeline(source);
        const code = result.code!;
        const alphaIdx = code.indexOf('#alpha');
        const betaIdx = code.indexOf('publicBeta');
        const gammaIdx = code.indexOf('#gamma');
        const deltaIdx = code.indexOf('publicDelta');
        expect(alphaIdx).toBeGreaterThan(-1);
        expect(betaIdx).toBeGreaterThan(-1);
        expect(gammaIdx).toBeGreaterThan(-1);
        expect(deltaIdx).toBeGreaterThan(-1);
        expect(alphaIdx).toBeLessThan(betaIdx);
        expect(betaIdx).toBeLessThan(gammaIdx);
        expect(gammaIdx).toBeLessThan(deltaIdx);
    });

    test('default parameter values survive round-trip', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #greet(name = 'world', times = 3) {
                    return name.repeat(times);
                }
            }
        `;

        const result = transformWithFullPipeline(source);
        const code = result.code!;
        expect(code).toContain('#greet');
        expect(code).toContain("'world'");
        expect(code).toContain('3');
        expect(code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('destructuring parameters survive round-trip', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #process({ x, y }, [a, b]) {
                    return x + y + a + b;
                }
            }
        `;

        const result = transformWithFullPipeline(source);
        const code = result.code!;
        expect(code).toContain('#process');
        expect(code).toMatch(/\{\s*x,\s*y\s*\}/);
        expect(code).toMatch(/\[\s*a,\s*b\s*\]/);
        expect(code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('empty method body round-trips', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #noop() {}
            }
        `;

        const result = transformWithFullPipeline(source);
        expect(result.code).toContain('#noop');
        expect(result.code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('private and public method with same name coexist', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #foo() { return 'private'; }
                foo() { return 'public'; }
            }
        `;

        const result = transformWithFullPipeline(source);
        const code = result.code!;
        expect(code).toContain('#foo');
        expect(code).toContain("return 'private'");
        expect(code).toContain("return 'public'");
        expect(code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('intermediate plugin that modifies method body does not break reverse transform', () => {
        function bodyModifierPlugin({ types: t }: any) {
            return {
                visitor: {
                    ClassMethod(path: any) {
                        const key = path.get('key');
                        if (
                            key.isIdentifier() &&
                            key.node.name.startsWith('__lwc_component_class_internal_private_')
                        ) {
                            const logStatement = t.expressionStatement(
                                t.callExpression(
                                    t.memberExpression(
                                        t.identifier('console'),
                                        t.identifier('log')
                                    ),
                                    [t.stringLiteral('injected')]
                                )
                            );
                            path.node.body.body.unshift(logStatement);
                        }
                    },
                },
            };
        }

        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #myMethod() { return 42; }
            }
        `;

        const result = transformSync(source, {
            ...BASE_CONFIG,
            plugins: [
                LwcPrivateMethodTransform,
                [plugin, { ...BASE_OPTS }],
                bodyModifierPlugin,
                LwcReversePrivateMethodTransform,
            ],
        });
        expect(result.code).toContain('#myMethod');
        expect(result.code).toContain('console.log("injected")');
        expect(result.code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('intermediate plugin that adds a prefixed method triggers collision', () => {
        function prefixedMethodInjectorPlugin({ types: t }: any) {
            let injected = false;
            return {
                visitor: {
                    ClassMethod(path: any) {
                        if (injected) return;
                        injected = true;
                        path.insertAfter(
                            t.classMethod(
                                'method',
                                t.identifier('__lwc_component_class_internal_private_injected'),
                                [],
                                t.blockStatement([t.returnStatement(t.stringLiteral('injected'))])
                            )
                        );
                    },
                },
            };
        }

        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #realMethod() { return 1; }
            }
        `;

        expect(() =>
            transformSync(source, {
                ...BASE_CONFIG,
                plugins: [
                    LwcPrivateMethodTransform,
                    [plugin, { ...BASE_OPTS }],
                    prefixedMethodInjectorPlugin,
                    LwcReversePrivateMethodTransform,
                ],
            })
        ).toThrowError(/cannot start with reserved prefix `__lwc_`/);
    });

    test('methods with similar but non-matching prefixes are not reverse-transformed', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                __lwc_component_class_internal_foo() { return 1; }
                __lwc_component_class_internal_privatefoo() { return 2; }
            }
        `;

        const result = transformWithFullPipeline(source);
        const code = result.code!;
        expect(code).toContain('__lwc_component_class_internal_foo');
        expect(code).toContain('__lwc_component_class_internal_privatefoo');
        expect(code).not.toContain('#foo');
    });

    test('private field throws unsupported error', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #count = 0;
            }
        `;

        expect(() => transformWithFullPipeline(source)).toThrowError(
            /Private fields are not currently supported\. Only private methods are supported\./
        );
    });

    test('private field alongside private method throws unsupported error', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #count = 0;
                #increment() {
                    this.#count++;
                }
            }
        `;

        expect(() => transformWithFullPipeline(source)).toThrowError(
            /Private fields are not currently supported/
        );
    });

    test('private method call sites do not leak prefixed names after round-trip', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #doWork(x) { return x * 2; }
                connectedCallback() {
                    const result = this.#doWork(21);
                    console.log(result);
                }
            }
        `;

        const result = transformWithFullPipeline(source);
        const code = result.code!;
        expect(code).toContain('this.#doWork(21)');
        expect(code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('private field with initializer throws unsupported error', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #state = { ready: false };
            }
        `;

        expect(() => transformWithFullPipeline(source)).toThrowError(
            /Private fields are not currently supported/
        );
    });

    test('forward-only output transforms call sites to prefixed names', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #doWork(x) { return x * 2; }
                connectedCallback() {
                    const result = this.#doWork(21);
                    console.log(result);
                }
            }
        `;

        const result = transformForwardOnly(source);
        const code = result.code!;
        expect(code).toContain('this.__lwc_component_class_internal_private_doWork(21)');
        expect(code).not.toContain('this.#doWork');
    });

    test('forward references in call sites are transformed', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                connectedCallback() {
                    return this.#helper();
                }
                #helper() { return 42; }
            }
        `;

        const result = transformForwardOnly(source);
        const code = result.code!;
        expect(code).toContain('this.__lwc_component_class_internal_private_helper()');
        expect(code).not.toContain('this.#helper');

        const roundTrip = transformWithFullPipeline(source);
        expect(roundTrip.code).toContain('this.#helper()');
        expect(roundTrip.code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('multiple invocations of the same private method are all transformed', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #compute(x) { return x * 2; }
                run() {
                    const a = this.#compute(1);
                    const b = this.#compute(2);
                    const c = this.#compute(3);
                    return a + b + c;
                }
            }
        `;

        const result = transformForwardOnly(source);
        const code = result.code!;
        const matches = code.match(/__lwc_component_class_internal_private_compute/g);
        // 1 definition + 3 call sites = 4 occurrences
        expect(matches).toHaveLength(4);

        const roundTrip = transformWithFullPipeline(source);
        expect(roundTrip.code).not.toContain('__lwc_component_class_internal_private_');
        const privateMatches = roundTrip.code!.match(/#compute/g);
        expect(privateMatches).toHaveLength(4);
    });

    test('self-referencing private method round-trips', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #recursive(n) {
                    if (n <= 0) return 0;
                    return n + this.#recursive(n - 1);
                }
            }
        `;

        const result = transformForwardOnly(source);
        const code = result.code!;
        expect(code).toContain('this.__lwc_component_class_internal_private_recursive(n - 1)');

        const roundTrip = transformWithFullPipeline(source);
        expect(roundTrip.code).toContain('this.#recursive(n - 1)');
        expect(roundTrip.code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('private method reference without call round-trips', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #handler() { return 42; }
                connectedCallback() {
                    const fn = this.#handler;
                    setTimeout(this.#handler, 100);
                }
            }
        `;

        const result = transformForwardOnly(source);
        const code = result.code!;
        expect(code).toContain('this.__lwc_component_class_internal_private_handler;');
        expect(code).toContain('this.__lwc_component_class_internal_private_handler, 100');
        expect(code).not.toContain('this.#handler');

        const roundTrip = transformWithFullPipeline(source);
        expect(roundTrip.code).toContain('this.#handler;');
        expect(roundTrip.code).toContain('this.#handler, 100');
        expect(roundTrip.code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('cross-method private call sites in forward-only output', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #helper() { return 42; }
                #caller() {
                    return this.#helper() + 1;
                }
            }
        `;

        const result = transformForwardOnly(source);
        const code = result.code!;
        expect(code).toContain('this.__lwc_component_class_internal_private_helper()');
        expect(code).toContain('__lwc_component_class_internal_private_caller');
        expect(code).not.toContain('#helper');
        expect(code).not.toContain('#caller');
    });
});
