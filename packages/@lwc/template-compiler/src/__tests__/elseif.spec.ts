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
                message: `LWC1159: 'lwc:elseif' directive must be used immediately after an element with 'lwc:if' or 'lwc:elseif'. No such element found.`,
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
                message: `LWC1159: 'lwc:else' directive must be used immediately after an element with 'lwc:if' or 'lwc:elseif'. No such element found.`,
                location: EXPECTED_LOCATION,
            });
        });
        it('lwc:elseif cannot be preceded by a text node', () => {
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
                message: `LWC1159: 'lwc:elseif' directive must be used immediately after an element with 'lwc:if' or 'lwc:elseif'. No such element found.`,
                location: EXPECTED_LOCATION,
            });
        });
        it('lwc:else cannot be preceded by a text node', () => {
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
                message: `LWC1159: 'lwc:else' directive must be used immediately after an element with 'lwc:if' or 'lwc:elseif'. No such element found.`,
                location: EXPECTED_LOCATION,
            });
        });
    });

    describe('invalid uses', () => {
        it('should throw an error when lwc:else has an expression value', () => {
            const { warnings } = parseTemplate(
                `<template>
                    <template lwc:if={visible}>Conditional Text</template>
                    <template lwc:else={invalidCondition}>Invalid Text</template>
                </template>`
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({});
        });
        it('should throw an error when lwc:else has a string value', () => {
            const { warnings } = parseTemplate(
                `<template>
                    <template lwc:if={visible}>Conditional Text</template>
                    <template lwc:else="invalid">Invalid Text</template>
                </template>`
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({});
        });
        it('multiple directives on single element - if and elseif', () => {
            const { warnings } = parseTemplate(
                `<template><template lwc:if={visible} lwc:elseif={elseif}>Conditional Text</template></template>`
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message: `LWC1156: Invalid usage of 'lwc:if' and 'lwc:elseif' directives on the same element.`,
                location: EXPECTED_LOCATION,
            });
        });
        it('multiple directives on single element - if and else', () => {
            const { warnings } = parseTemplate(
                `<template><template lwc:else lwc:if={visible}>Conditional Text</template></template>`
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message: `LWC1156: Invalid usage of 'lwc:if' and 'lwc:else' directives on the same element.`,
                location: EXPECTED_LOCATION,
            });
        });
        it('multiple directives on single element - elseif and else', () => {
            const { warnings } = parseTemplate(
                `<template>
                    <template lwc:if={visible}></template>
                    <template lwc:else lwc:elseif={visible}>Conditional Text</template>
                </template>`
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message: `LWC1157: Invalid usage of 'lwc:elseif' and 'lwc:else' directives on the same element.`,
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
                message: `LWC1159: 'lwc:elseif' directive must be used immediately after an element with 'lwc:if' or 'lwc:elseif'. No such element found.`,
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
                message: `LWC1159: 'lwc:else' directive must be used immediately after an element with 'lwc:if' or 'lwc:elseif'. No such element found.`,
                location: EXPECTED_LOCATION,
            });
        });

        it('should throw an error when lwc:elseif is used on an element with if:true', () => {
            const { warnings } = parseTemplate(
                `<template>
                    <template lwc:if={visible}>Conditional Text</template>
                    <template if:true={visible} lwc:elseif={elseif}>Elseif Text</template>
                </template>`
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message: `LWC1160: 'if:true' directive cannot be used with 'lwc:if', 'lwc:elseif', or 'lwc:else directives on the same element.`,
                location: EXPECTED_LOCATION,
            });
        });

        it('should throw an error when lwc:else is used on an element with if:true', () => {
            const { warnings } = parseTemplate(
                `<template>
                    <template lwc:if={visible}>Conditional Text</template>
                    <template if:true={visible} lwc:else>Conditional Text</template>
                </template>`
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message: `LWC1160: 'if:true' directive cannot be used with 'lwc:if', 'lwc:elseif', or 'lwc:else directives on the same element.`,
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
                    type: 'ElseifBlock',
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
                    type: 'ElseifBlock',
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
                    type: 'ElseifBlock',
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
                    type: 'ElseifBlock',
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
                    type: 'ElseifBlock',
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
                    type: 'ElseifBlock',
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
                                        type: 'ElseifBlock',
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

    describe('mixed', () => {
        it('if-elseif-else', () => {
            const { root } = parseTemplate(
                `<template>
                    <template lwc:if={visible}>Conditional Text</template>
                    <div lwc:elseif={elseifCondition}>Elseif!</div>
                    <c-default lwc:else>Else!</c-default>
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
                    type: 'ElseifBlock',
                    condition: {
                        type: 'Identifier',
                    },
                    children: [
                        {
                            type: 'Element',
                            name: 'div',
                        },
                    ],
                    else: {
                        type: 'ElseBlock',
                        children: [
                            {
                                type: 'Component',
                                name: 'c-default',
                            },
                        ],
                    },
                },
            });
        });
    });

    describe('slots', () => {
        it('should warn about duplicate slots when the slots are not rendered in a conditional tree', () => {
            const { warnings } = parseTemplate(
                `<template>
                    <div>
                        <div>
                            <slot name="conditional-slot"></slot>
                        </div>
                    </div>
                    <div>Separator</div>
                    <div>
                        <slot name="conditional-slot"></slot>
                    </div>
                </template>`
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Warning,
                message: `LWC1137: Invalid duplicate slot (name="conditional-slot").`,
                location: EXPECTED_LOCATION,
            });
        });
        it('should not warn about duplicate slots when the slot is rendered in separate branches of the same conditional tree', () => {
            const { root, warnings } = parseTemplate(
                `<template>
                    <template lwc:if={condition}>
                        <slot name="conditional-slot"></slot>
                    </template>
                    <template lwc:else>
                        <slot name="conditional-slot"></slot>
                    </template>
                </template>`
            );

            expect(warnings.length).toBe(0);
            expect(root.children[0]).toMatchObject({
                type: 'IfBlock',
                children: [
                    {
                        type: 'Slot',
                    },
                ],
                else: {
                    type: 'ElseBlock',
                    children: [
                        {
                            type: 'Slot',
                        },
                    ],
                },
            });
        });
        it('should not warn about duplicate slots when the slot is rendered in separate branches of a complex conditional tree', () => {
            const { warnings } = parseTemplate(
                `<template>
                    <slot name="outer-slot"></slot>
                    <template lwc:if={condition}>
                        <template lwc:if={nested}>
                            Conditional Nested Text
                            <slot name="nested-slot"></slot>
                        </template>
                        <template lwc:else>
                            <template lwc:if={doubleNested}>
                                Double Nested
                            </template>
                            <template lwc:elseif={doubleNestedAlt}>
                                <div lwc:if={tripleNested}>
                                    <div>
                                        Triple Nested Text
                                        <slot name="nested-slot"></slot>
                                    </div>
                                </div>
                            </template>
                            <template lwc:else>
                                Else
                                <slot name="nested-slot"></slot>
                            </template>
                        </template>
                        <slot name="conditional-slot"></slot>
                    </template>
                    <template lwc:else>
                        <slot name="conditional-slot"></slot>
                        <slot name="nested-slot"></slot>
                    </template>
                </template>`
            );

            expect(warnings.length).toBe(0);
        });
        it('should warn about duplicate slots when the slots are not in the same conditional tree', () => {
            const { warnings } = parseTemplate(
                `<template>
                    <template lwc:if={condition}>
                        Conditional Text
                    </template>
                    <template lwc:elseif={altCondition}>
                        <div>
                            <slot name="outside-slot"></slot>
                        </div>
                    </template>
                    <template lwc:else>
                        <slot name="outside-slot"></slot>
                    </template>
                    <template lwc:if={anotherCondition}>
                        Another Conditional Text
                    </template>
                    <template lwc:elseif={anotherAltCondition}>
                        <div>
                            <slot name="outside-slot"></slot>
                        </div>
                    </template>
                </template>`
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Warning,
                message: `LWC1137: Invalid duplicate slot (name="outside-slot").`,
                location: EXPECTED_LOCATION,
            });
        });
        it('should warn about duplicate slots when the slots are in the same branch of the conditional tree', () => {
            const { warnings } = parseTemplate(
                `<template>
                    <template lwc:if={condition}>
                        <slot name="nested-slot"></slot>
                        <div>
                            <slot name="nested-slot"></slot>
                        </div>
                    </template>
                    <template lwc:else>
                        Alternative Text
                    </template>
                </template>`
            );

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Warning,
                message: `LWC1137: Invalid duplicate slot (name="nested-slot").`,
                location: EXPECTED_LOCATION,
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
                message: `LWC1159: 'lwc:else' directive must be used immediately after an element with 'lwc:if' or 'lwc:elseif'. No such element found.`,
                location: EXPECTED_LOCATION,
            });
        });
    });
});
