/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DiagnosticLevel } from '@lwc/errors';

import { EXPECTED_LOCATION, parseTemplate } from './utils';

describe('lwc if/elseif/else directives', () => {
    describe('lwc:if required', () => {
        it('lwc:elseif should be immediately preceded by a sibling lwc:if or lwc:elseif', () => {
            const { warnings } = parseTemplate(
                `<template>
                    <template lwc:if={visible}>If!</template>
                    <div></div>
                    <template lwc:elseif={elseif}>Elseif!</template>
                </template>`
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message: `LWC1158: 'lwc:elseif' directive must be used immediately after an element with 'lwc:if' or 'lwc:elseif'. No such element found.`,
                location: EXPECTED_LOCATION,
            });
        });
        it('lwc:else should be immediately preceded by a sibling lwc:if or lwc:elseif', () => {
            const { warnings } = parseTemplate(
                `<template>
                    <template lwc:if={visible}>If!</template>
                    <div></div>
                    <template lwc:else>Else!</template>
                </template>`
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message: `LWC1158: 'lwc:else' directive must be used immediately after an element with 'lwc:if' or 'lwc:elseif'. No such element found.`,
                location: EXPECTED_LOCATION,
            });
        });
        it('lwc:elseif should be immediately preceded by a sibling lwc:if or lwc:elseif, text nodes included', () => {
            const { warnings } = parseTemplate(
                `<template>
                    <template lwc:if={visible}>If!</template>
                    Header Text
                    <template lwc:elseif={elseif}>Elseif!</template>
                </template>`
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message: `LWC1158: 'lwc:elseif' directive must be used immediately after an element with 'lwc:if' or 'lwc:elseif'. No such element found.`,
                location: EXPECTED_LOCATION,
            });
        });
        it('lwc:else should be immediately preceded by a sibling lwc:if or lwc:elseif, text nodes included', () => {
            const { warnings } = parseTemplate(
                `<template>
                    <template lwc:if={visible}>If!</template>
                    Header Text
                    <template lwc:else>Else!</template>
                </template>`
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message: `LWC1158: 'lwc:else' directive must be used immediately after an element with 'lwc:if' or 'lwc:elseif'. No such element found.`,
                location: EXPECTED_LOCATION,
            });
        });
    });
    describe('invalid uses', () => {
        it('multiple directives on single element', () => {
            const { warnings } = parseTemplate(
                `<template><template lwc:if={visible} lwc:elseif={elseif} lwc:else>Conditional Text</template></template>`
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message: `LWC1155: Invalid usage of 'lwc:if' and 'lwc:elseif' directives on the same element.`,
                location: EXPECTED_LOCATION,
            });
        });
        it('multiple directives on single element - else first', () => {
            const { warnings } = parseTemplate(
                `<template><template lwc:else lwc:if={visible}>Conditional Text</template></template>`
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message: `LWC1155: Invalid usage of 'lwc:if' and 'lwc:else' directives on the same element.`,
                location: EXPECTED_LOCATION,
            });
        });
    });

    describe('interoperability with other directives', () => {
        it('should work with a for:each directive on the same element', () => {
            const { root } = parseTemplate(
                `<template>
                    <template for:each={items} for:item="item" lwc:if={visible}>Conditional Iteration</template>
                    <template for:each={altItems} for:item="item" lwc:else>Else Iteration</template>
                </template>`
            );

            expect(root.children[0]).toMatchObject({
                type: 'IfBlock',
                condition: {
                    type: 'Identifier',
                },
                children: [
                    {
                        type: 'ForEach',
                        expression: {
                            name: 'items',
                            type: 'Identifier',
                        },
                        children: [
                            {
                                type: 'Text',
                                raw: 'Conditional Iteration',
                            },
                        ],
                    },
                ],
                else: {
                    type: 'ElseBlock',
                    children: [
                        {
                            type: 'ForEach',
                            expression: {
                                name: 'altItems',
                                type: 'Identifier',
                            },
                            children: [
                                {
                                    type: 'Text',
                                    raw: 'Else Iteration',
                                },
                            ],
                        },
                    ],
                },
            });
        });

        it('should throw an error when lwc:elseif is used after if:true', () => {
            const { warnings } = parseTemplate(
                `<template>
                    <template if:true={visible}>If!</template>
                    <template lwc:elseif={elseIfCondition}>Else!</template>
                </template>`
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message: `LWC1158: 'lwc:elseif' directive must be used immediately after an element with 'lwc:if' or 'lwc:elseif'. No such element found.`,
                location: EXPECTED_LOCATION,
            });
        });
        it('should throw an error when lwc:else is used after if:true', () => {
            const { warnings } = parseTemplate(
                `<template>
                    <template if:true={visible}>If!</template>
                    <template lwc:else>Else!</template>
                </template>`
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message: `LWC1158: 'lwc:else' directive must be used immediately after an element with 'lwc:if' or 'lwc:elseif'. No such element found.`,
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

        it('nested', () => {
            const { root } = parseTemplate(
                `<template>
                    <c-custom lwc:if={visible}></c-custom>
                    <c-custom-elseif lwc:elseif={elseif}>
                        If Text
                        <c-nested lwc:if={showNestedIf}>
                            <c-double-nested lwc:if={doubleNestedIf}></c-double-nested>
                            <c-double-nested-else lwc:else></c-double-nested-else>
                        </c-nested>
                        <c-nested-elseif lwc:elseif={elseifNested}></c-nested-elseif>
                        <c-nested-else lwc:else></c-nested-else>
                    </c-custom-elseif>
                    <c-custom-else lwc:else></c-custom-else>
                </template>`
            );

            expect(root.children[0]).toMatchObject({
                type: 'IfBlock',
                children: [
                    {
                        type: 'Component',
                        name: 'c-custom',
                        children: [],
                    },
                ],
                else: {
                    type: 'IfBlock',
                    children: [
                        {
                            type: 'Component',
                            name: 'c-custom-elseif',
                            children: [
                                {
                                    type: 'Text',
                                    raw: 'If Text',
                                },
                                {
                                    type: 'IfBlock',
                                    children: [
                                        {
                                            type: 'Component',
                                            name: 'c-nested',
                                            children: [
                                                {
                                                    type: 'IfBlock',
                                                    children: [
                                                        {
                                                            type: 'Component',
                                                            name: 'c-double-nested',
                                                        },
                                                    ],
                                                    else: {
                                                        type: 'ElseBlock',
                                                        children: [
                                                            {
                                                                type: 'Component',
                                                                name: 'c-double-nested-else',
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                    else: {
                                        type: 'IfBlock',
                                        children: [
                                            {
                                                type: 'Component',
                                                name: 'c-nested-elseif',
                                                children: [],
                                            },
                                        ],
                                        else: {
                                            type: 'ElseBlock',
                                            children: [
                                                {
                                                    type: 'Component',
                                                    name: 'c-nested-else',
                                                },
                                            ],
                                        },
                                    },
                                },
                            ],
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
    describe('preserve-comments', () => {
        it('should allow comments between directives when preserve-comments is disabled', () => {
            const { root } = parseTemplate(
                `<template>
                    <template lwc:if={visible}>Conditional Text</template>
                    <!-- Comment -->
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
            expect(root.children[1]).toMatchObject({
                type: 'Comment',
            });
        });
        it('should not allow comments between directives when preserve-comments is enabled', () => {
            const { warnings } = parseTemplate(
                `<template>
                    <template lwc:if={visible}>Conditional Text</template>
                    <!-- Comment -->
                    <template lwc:else>Else!</template>
                </template>`,
                {
                    preserveHtmlComments: true,
                }
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message: `LWC1158: 'lwc:else' directive must be used immediately after an element with 'lwc:if' or 'lwc:elseif'. No such element found.`,
                location: EXPECTED_LOCATION,
            });
        });
    });
});
