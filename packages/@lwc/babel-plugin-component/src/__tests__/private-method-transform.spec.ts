/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// These tests exercise Babel pipelines that cannot be represented as fixture tests.
// Fixture tests run the full forward → main-plugin → class-properties → reverse pipeline,
// but the tests here need one of the following non-standard setups:
//   • Forward-only pipeline (transformForwardOnly) — no reverse transform
//   • Reverse-only pipeline (transformReverseOnly) — no forward transform
//   • Custom intermediate Babel plugin inserted between the forward and reverse transforms

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
            /cannot start with reserved prefix `__lwc_`\./
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

    test('cross-class #privateName access is a parse error', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class A extends LightningElement {
                #privateMethod() {}
            }
            class B extends LightningElement {
                hax() {
                    this.#privateMethod();
                    this.__lwc_component_class_internal_private_privateMethod();
                }
            }
        `;

        expect(() => transformWithFullPipeline(source)).toThrowError(
            /Private name #privateMethod is not defined/
        );
    });

    test('cross-class spoofed mangled name is round-tripped back to a harmless private method', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class A extends LightningElement {
                #privateMethod() {}
            }
            class B extends LightningElement {
                __lwc_component_class_internal_private_privateMethod() {
                    return 'spoofed';
                }
            }
        `;

        const result = transformWithFullPipeline(source);
        const code = result.code!;
        expect(code).not.toContain('__lwc_component_class_internal_private_');
        expect((code.match(/#privateMethod/g) || []).length).toBe(2);
    });

    test('private field compiles successfully without LWC1214 error', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #count = 0;

                increment() {
                    this.#count++;
                }
            }
        `;

        // Should not throw - private fields are now allowed
        const result = transformWithFullPipeline(source);
        expect(result.code).toContain('increment');
        // Private field gets transformed by Babel's class properties plugin
        expect(result.code).toBeDefined();
    });

    test('private field with private method compiles successfully', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #count = 0;

                #increment() {
                    this.#count++;
                }

                publicIncrement() {
                    this.#increment();
                }
            }
        `;

        const result = transformWithFullPipeline(source);
        expect(result.code).toContain('publicIncrement');
        expect(result.code).toContain('#increment');
        expect(result.code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('multiple private fields compile successfully', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #payload;
                #cache = new Map();
                #isDirty = false;

                constructor() {
                    super();
                    this.#payload = {};
                }

                setData(data) {
                    this.#payload = data;
                    this.#isDirty = true;
                    this.#cache.set('data', data);
                }

                getData() {
                    return this.#payload;
                }
            }
        `;

        // Should compile without throwing LWC1214
        const result = transformWithFullPipeline(source);
        expect(result.code).toContain('setData');
        expect(result.code).toContain('getData');
        expect(result.code).toBeDefined();
    });
});
