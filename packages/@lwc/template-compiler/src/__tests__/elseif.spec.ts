/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DiagnosticLevel } from '@lwc/errors';

import { EXPECTED_LOCATION, parseTemplate } from './utils';

describe('lwc conditional directives', () => {
    describe('invalid uses', () => {
        it('multiple directives on single element - lwc:if first', () => {
            const { warnings } = parseTemplate(
                `<template><template lwc:if={visible} lwc:else>Conditional Text</template></template>`
            );

            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message: `LWC1155: Invalid usage of 'lwc:if' and 'lwc:else' directives on the same element.`,
                location: EXPECTED_LOCATION,
            });
        });
        it('multiple directives on single element - lwc:else first', () => {
            const { warnings } = parseTemplate(
                `<template><template lwc:else lwc:if={visible}>Conditional Text</template></template>`
            );

            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message: `LWC1155: Invalid usage of 'lwc:if' and 'lwc:else' directives on the same element.`,
                location: EXPECTED_LOCATION,
            });
        });
    });
    describe('template elements', () => {
        it('lwc:if directive', () => {
            const { root } = parseTemplate(
                `<template><template lwc:if={visible}>Conditional Text</template></template>`
            );

            expect(root.children[0]).toMatchObject({
                type: 'IfBlock',
                condition: {
                    type: 'Identifier',
                },
                children: [{ type: 'Text' }],
            });
            expect(root.children[0].else).toBeUndefined();
        });

        it('lwc:elseif directive', () => {
            const { root } = parseTemplate(
                `<template>
                    <template lwc:if={visible}>Conditional Text</template>
                    <template lwc:elseif={displayAlt}>Elseif!</template>
                </template>`
            );

            expect(root.children[0]).toMatchObject({
                type: 'IfBlock',
                condition: {
                    type: 'Identifier',
                },
                children: [
                    {
                        type: 'Text',
                        raw: 'Conditional Text',
                    },
                ],
                else: {
                    type: 'IfBlock',
                    condition: {
                        type: 'Identifier',
                    },
                    children: [
                        {
                            type: 'Text',
                            raw: 'Elseif!',
                        },
                    ],
                },
            });
            expect(root.children[0].else.else).toBeUndefined();
        });

        it('lwc:else directive', () => {
            const { root } = parseTemplate(
                `<template>
                    <template lwc:if={visible}>Conditional Text</template>
                    <template lwc:else>Else!</template>
                </template>`
            );

            expect(root.children[0]).toMatchObject({
                type: 'IfBlock',
                condition: {
                    type: 'Identifier',
                },
                children: [{ type: 'Text' }],
                else: { type: 'ElseBlock' },
            });
        });

        it('if-elseif-else', () => {
            const { root } = parseTemplate(
                `<template>
                    <template lwc:if={visible}>Conditional Text</template>
                    <template lwc:elseif={elseifCondition}>Elseif!</template>
                    <template lwc:else>Else!</template>
                </template>`
            );

            expect(root.children[0]).toMatchObject({
                type: 'IfBlock',
                condition: {
                    type: 'Identifier',
                },
                children: [
                    {
                        type: 'Text',
                        raw: 'Conditional Text',
                    },
                ],
                else: {
                    type: 'IfBlock',
                    condition: {
                        type: 'Identifier',
                    },
                    children: [
                        {
                            type: 'Text',
                            raw: 'Elseif!',
                        },
                    ],
                    else: {
                        type: 'ElseBlock',
                        children: [
                            {
                                type: 'Text',
                                raw: 'Else!',
                            },
                        ],
                    },
                },
            });
        });
    });

    describe('html elements', () => {
        it('lwc:if directive', () => {
            const { root } = parseTemplate(`<template><h1 lwc:if={visible}></h1></template>`);

            expect(root.children[0]).toMatchObject({
                type: 'IfBlock',
                condition: {
                    type: 'Identifier',
                },
                children: [
                    {
                        type: 'Element',
                        name: 'h1',
                    },
                ],
            });
            expect(root.children[0].else).toBeUndefined();
        });

        it('lwc:elseif directive', () => {
            const { root } = parseTemplate(
                `<template>
                    <h1 lwc:if={visible}>Visible Header</h1>
                    <h1 lwc:elseif={elseifCondition}>First Alternative Header</h1>
                </template>`
            );

            expect(root.children[0]).toMatchObject({
                type: 'IfBlock',
                condition: {
                    type: 'Identifier',
                },
                children: [
                    {
                        type: 'Element',
                        name: 'h1',
                        children: [
                            {
                                type: 'Text',
                                raw: 'Visible Header',
                            },
                        ],
                    },
                ],
                else: {
                    type: 'IfBlock',
                    condition: {
                        type: 'Identifier',
                    },
                    children: [
                        {
                            type: 'Element',
                            name: 'h1',
                            children: [
                                {
                                    type: 'Text',
                                    raw: 'First Alternative Header',
                                },
                            ],
                        },
                    ],
                },
            });
            expect(root.children[0].else.else).toBeUndefined();
        });

        it('lwc:else directive', () => {
            const { root } = parseTemplate(
                `<template>
                    <h1 lwc:if={visible}>Visible Header</h1>
                    <h1 lwc:else>Alternative Header</h1>
                </template>`
            );

            expect(root.children[0]).toMatchObject({
                type: 'IfBlock',
                condition: {
                    type: 'Identifier',
                },
                children: [
                    {
                        type: 'Element',
                        name: 'h1',
                        children: [
                            {
                                type: 'Text',
                                raw: 'Visible Header',
                            },
                        ],
                    },
                ],
                else: {
                    type: 'ElseBlock',
                    children: [
                        {
                            type: 'Element',
                            name: 'h1',
                            children: [
                                {
                                    type: 'Text',
                                    raw: 'Alternative Header',
                                },
                            ],
                        },
                    ],
                },
            });
        });

        it('if-elseif-else', () => {
            const { root } = parseTemplate(
                `<template>
                    <h1 lwc:if={visible}>Visible Header</h1>
                    <h1 lwc:elseif={elseifCondition}>First Alternative Header</h1>
                    <h1 lwc:else={elseCondition}>Alternative Header</h1>
                </template>`
            );

            expect(root.children[0]).toMatchObject({
                type: 'IfBlock',
                condition: {
                    type: 'Identifier',
                },
                children: [
                    {
                        type: 'Element',
                        name: 'h1',
                        children: [
                            {
                                type: 'Text',
                                raw: 'Visible Header',
                            },
                        ],
                    },
                ],
                else: {
                    type: 'IfBlock',
                    condition: {
                        type: 'Identifier',
                    },
                    children: [
                        {
                            type: 'Element',
                            name: 'h1',
                            children: [
                                {
                                    type: 'Text',
                                    raw: 'First Alternative Header',
                                },
                            ],
                        },
                    ],
                    else: {
                        type: 'ElseBlock',
                        children: [
                            {
                                type: 'Element',
                                name: 'h1',
                                children: [
                                    {
                                        type: 'Text',
                                        raw: 'Alternative Header',
                                    },
                                ],
                            },
                        ],
                    },
                },
            });
        });
    });

    describe('components', () => {
        it('lwc:if directive', () => {
            const { root } = parseTemplate(
                `<template><c-custom lwc:if={visible}></c-custom></template>`
            );

            expect(root.children[0]).toMatchObject({
                type: 'IfBlock',
                condition: {
                    type: 'Identifier',
                },
                children: [
                    {
                        type: 'Component',
                        name: 'c-custom',
                    },
                ],
            });
            expect(root.children[0].else).toBeUndefined();
        });

        it('lwc:else directive', () => {
            const { root } = parseTemplate(
                `<template>
                    <c-custom lwc:if={visible}></c-custom>
                    <c-custom-alt lwc:else></c-custom-alt>
                </template>`
            );

            expect(root.children[0]).toMatchObject({
                type: 'IfBlock',
                condition: {
                    type: 'Identifier',
                },
                children: [
                    {
                        type: 'Component',
                        name: 'c-custom',
                    },
                ],
                else: {
                    type: 'ElseBlock',
                    children: [
                        {
                            type: 'Component',
                            name: 'c-custom-alt',
                        },
                    ],
                },
            });
        });

        it('if-elseif-else', () => {
            const { root } = parseTemplate(
                `<template>
                    <c-custom lwc:if={visible}></c-custom>
                    <c-custom-elseif lwc:elseif={elseif}></c-custom-elseif>
                    <c-custom-else lwc:else></c-custom-else>
                </template>`
            );

            expect(root.children[0]).toMatchObject({
                type: 'IfBlock',
                condition: {
                    type: 'Identifier',
                },
                children: [
                    {
                        type: 'Component',
                        name: 'c-custom',
                        children: [],
                    },
                ],
                else: {
                    type: 'IfBlock',
                    condition: {
                        type: 'Identifier',
                    },
                    children: [
                        {
                            type: 'Component',
                            name: 'c-custom-elseif',
                            children: [],
                        },
                    ],
                    else: {
                        type: 'ElseBlock',
                        children: [
                            {
                                type: 'Component',
                                name: 'c-custom-else',
                                children: [],
                            },
                        ],
                    },
                },
            });
        });
    });
});
