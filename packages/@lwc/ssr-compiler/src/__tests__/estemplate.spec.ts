/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is, builders as b } from 'estree-toolkit';
import { esTemplate, esTemplateWithYield } from '../estemplate';

Object.entries({
    esTemplate,
    esTemplateWithYield,
}).forEach(([topLevelFnName, topLevelFn]) => {
    const yieldStmtsAllowed = topLevelFnName === 'esTemplateWithYield';

    describe(topLevelFnName, () => {
        describe('failure upon parse', () => {
            yieldStmtsAllowed ||
                test('with yield statements', () => {
                    const createTemplate = () => topLevelFn`
                    const foo = "bar";
                    yield foo;
                `;
                    expect(createTemplate).toThrow('Unexpected token');
                });

            test('when attempting to replace unreplaceable code constructs', () => {
                // Someone might try to create a template where 'class' or 'function'
                // is provided as an argument to the ES template.
                const isFunctionOrClass = (node: any) =>
                    is.functionDeclaration(node) || is.classDeclaration(node);
                const createTemplate = () => topLevelFn`
                    ${isFunctionOrClass} classOrFunctionDecl {}
                `;
                expect(createTemplate).toThrow('Unexpected token');
            });

            test('syntax errors due to typo', () => {
                const createTemplate = () => topLevelFn`
                    calss MyCmp extends LightningElement {
                        connectedCallbac() {
                            console.log('if you see this, calss has been added to the JS language');
                        }
                    }
                `;
                expect(createTemplate).toThrow('Unexpected token');
            });
        });

        describe('failure upon invocation', () => {
            test('when replacing incorrect node type', () => {
                const tmpl = topLevelFn`
                    const ${is.identifier} = 'foo';
                `;
                const doReplacement = () => tmpl(b.literal('I am not an identifier'));
                expect(doReplacement).toThrow(
                    'Validation failed for templated node of type Identifier'
                );
            });
        });

        describe('successful replacement', () => {
            yieldStmtsAllowed &&
                test('with yield statements', () => {
                    const tmpl = topLevelFn`
                    yield ${is.literal};
                `;
                    const replacedAst = tmpl(b.literal('foo'));

                    expect(replacedAst).toMatchObject({
                        expression: {
                            argument: {
                                type: 'Literal',
                                value: 'foo',
                            },
                            delegate: false,
                            type: 'YieldExpression',
                        },
                        type: 'ExpressionStatement',
                    });
                });

            test('with LH identifier nodes', () => {
                const tmpl = topLevelFn`
                    const ${is.identifier} = 'foobar'
                `;
                const replacedAst = tmpl(b.identifier('heyImNewHere'));
                expect(replacedAst).toMatchObject({
                    declarations: [
                        {
                            id: {
                                name: 'heyImNewHere',
                                type: 'Identifier',
                            },
                            init: {
                                type: 'Literal',
                                value: 'foobar',
                            },
                            type: 'VariableDeclarator',
                        },
                    ],
                    kind: 'const',
                    type: 'VariableDeclaration',
                });
            });
            test('with multiple nodes', () => {
                const tmpl = topLevelFn`
                    const foo = ${is.literal} + ${is.identifier};
                    fnCall(foo, ${is.objectExpression});
                `;
                const replacedAst = tmpl(
                    b.literal(5),
                    b.identifier('bar'),
                    b.objectExpression([
                        b.property('init', b.literal('config'), b.literal('someConfig')),
                    ])
                );

                expect(replacedAst).toMatchObject([
                    {
                        declarations: [
                            {
                                id: {
                                    name: 'foo',
                                    type: 'Identifier',
                                },
                                init: {
                                    left: {
                                        type: 'Literal',
                                        value: 5,
                                    },
                                    operator: '+',
                                    right: {
                                        name: 'bar',
                                        type: 'Identifier',
                                    },
                                    type: 'BinaryExpression',
                                },
                                type: 'VariableDeclarator',
                            },
                        ],
                        kind: 'const',
                        type: 'VariableDeclaration',
                    },
                    {
                        expression: {
                            arguments: [
                                {
                                    name: 'foo',
                                    type: 'Identifier',
                                },
                                {
                                    properties: [
                                        {
                                            computed: false,
                                            key: {
                                                type: 'Literal',
                                                value: 'config',
                                            },
                                            kind: 'init',
                                            shorthand: false,
                                            type: 'Property',
                                            value: {
                                                type: 'Literal',
                                                value: 'someConfig',
                                            },
                                        },
                                    ],
                                    type: 'ObjectExpression',
                                },
                            ],
                            callee: {
                                name: 'fnCall',
                                type: 'Identifier',
                            },
                            optional: false,
                            type: 'CallExpression',
                        },
                        type: 'ExpressionStatement',
                    },
                ]);
            });
        });
    });
});
