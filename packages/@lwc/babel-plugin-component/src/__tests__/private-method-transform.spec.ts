/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, expect, test } from 'vitest';
import { transformSync } from '@babel/core';
import plugin, { LwcReversePrivateMethodTransform } from '../index';

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
        plugins: [[plugin, { ...BASE_OPTS, ...opts }], LwcReversePrivateMethodTransform],
    });
}

function transformReverseOnly(source: string) {
    return transformSync(source, {
        ...BASE_CONFIG,
        plugins: [LwcReversePrivateMethodTransform],
    });
}

function transformForwardOnly(source: string, opts = {}) {
    return transformSync(source, {
        ...BASE_CONFIG,
        plugins: [[plugin, { ...BASE_OPTS, ...opts }]],
    });
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
        expect(result!.code).toContain('#privateMethod');
        expect(result!.code).not.toContain('__lwc_component_class_internal_private_');
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
        expect(result!.code).toContain('#methodA');
        expect(result!.code).toContain('#methodB');
        expect(result!.code).toContain('#methodC');
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
            /conflicts with internal naming conventions\. Please rename this function to avoid conflict/
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
            /conflicts with internal naming conventions\. Please rename this function to avoid conflict/
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
        expect(result!.code).toContain('#privateMethod');
        expect(result!.code).toContain('normalPublicMethod');
        expect(result!.code).toContain('_underscoreMethod');
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
        expect(result!.code).toContain('#fetchData');
        expect(result!.code).toContain('async');
        expect(result!.code).not.toContain('__lwc_component_class_internal_private_');
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
        expect(result!.code).toContain('#helper');
        expect(result!.code).toContain('static');
        expect(result!.code).not.toContain('__lwc_component_class_internal_private_');
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
        expect(result!.code).toContain('#compute');
        expect(result!.code).toContain('a');
        expect(result!.code).toContain('b');
        expect(result!.code).toContain('...rest');
        expect(result!.code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('private getters and setters are not transformed', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                get #value() {
                    return this._val;
                }
                set #value(v) {
                    this._val = v;
                }
            }
        `;

        const result = transformWithFullPipeline(source);
        expect(result!.code).toContain('get #value');
        expect(result!.code).toContain('set #value');
        expect(result!.code).not.toContain('__lwc_component_class_internal_private_');
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

        // The @api decorator validation (LWC1103) fires before the private method
        // transform, so the error comes from decorator validation rather than the
        // private method decorator check (LWC1212).
        expect(() => transformWithFullPipeline(source)).toThrowError(
            /"@api" can only be applied on class properties/
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
        expect(result!.code).toContain('publicMethod');
        expect(result!.code).toContain('anotherPublic');
        expect(result!.code).not.toContain('__lwc_component_class_internal_private_');
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
        expect(result!.code).toContain('#generate');
        expect(result!.code).toContain('yield');
        expect(result!.code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('reverse standalone on clean code succeeds without forward metadata', () => {
        const source = `
            class Test {
                publicMethod() { return 1; }
            }
        `;

        const result = transformReverseOnly(source);
        expect(result!.code).toContain('publicMethod');
    });

    test('reverse standalone with prefixed method throws collision when metadata is missing', () => {
        const source = `
            class Test {
                __lwc_component_class_internal_private_foo() { return 1; }
            }
        `;

        expect(() => transformReverseOnly(source)).toThrowError(
            /conflicts with internal naming conventions\. Please rename this function to avoid conflict/
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
        expect(result!.code).not.toContain('__lwc_component_class_internal_private_');
        const matches = result!.code!.match(/#shared/g);
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
        expect(result!.code).toContain('#helper');
        expect(result!.code).toContain('#caller');
        expect(result!.code).toContain('this.#helper()');
        expect(result!.code).not.toContain('__lwc_component_class_internal_private_');
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
        expect(result!.code).toContain('__lwc_component_class_internal_private_foo');
        expect(result!.code).toContain('__lwc_component_class_internal_private_bar');
        expect(result!.code).not.toContain('#foo');
        expect(result!.code).not.toContain('#bar');
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
        const code = result!.code!;
        expect(code).toContain('static');
        expect(code).toContain('async');
        expect(code).toContain('#fetch');
        expect(code).toContain('url');
        expect(code).toContain('opts');
        expect(code).not.toContain('__lwc_component_class_internal_private_');
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
        const code = result!.code!;
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
        const code = result!.code!;
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
        const code = result!.code!;
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
        expect(result!.code).toContain('#noop');
        expect(result!.code).not.toContain('__lwc_component_class_internal_private_');
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
        const code = result!.code!;
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
                [plugin, { ...BASE_OPTS }],
                bodyModifierPlugin,
                LwcReversePrivateMethodTransform,
            ],
        });
        expect(result!.code).toContain('#myMethod');
        expect(result!.code).toContain('console.log("injected")');
        expect(result!.code).not.toContain('__lwc_component_class_internal_private_');
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
                    [plugin, { ...BASE_OPTS }],
                    prefixedMethodInjectorPlugin,
                    LwcReversePrivateMethodTransform,
                ],
            })
        ).toThrowError(/conflicts with internal naming conventions/);
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
        const code = result!.code!;
        expect(code).toContain('__lwc_component_class_internal_foo');
        expect(code).toContain('__lwc_component_class_internal_privatefoo');
        expect(code).not.toContain('#foo');
    });
});
