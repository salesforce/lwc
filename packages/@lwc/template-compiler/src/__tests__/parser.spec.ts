/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { mergeConfig } from '../config';
import State from '../state';
import parse from '../parser';

import { DiagnosticLevel } from '@lwc/errors';

const TEMPLATE_EXPRESSION = { type: 'MemberExpression' };
const TEMPLATE_IDENTIFIER = { type: 'Identifier' };

const EXPECTED_LOCATION = expect.objectContaining({
    line: expect.any(Number),
    column: expect.any(Number),
    start: expect.any(Number),
    length: expect.any(Number),
});

function parseTemplate(src: string): any {
    const config = mergeConfig({}, { format: 'module' });
    const state = new State(config);

    const res = parse(src, state);
    return {
        ...res,
        state,
    };
}

describe('parsing', () => {
    it('simple parsing', () => {
        const { root } = parseTemplate(`<template><h1>hello</h1></template>`);
        expect(root.tag).toBe('template');
        expect(root.children[0].tag).toBe('h1');
        expect(root.children[0].children[0].value).toBe('hello');
    });

    it('html entities', () => {
        const { root } = parseTemplate(`<template>
            <p>foo&amp;bar</p>
            <p>const &#123; foo &#125; = bar;</p>
        </template>`);
        expect(root.children[0].children[0].value).toBe('foo&bar');
        expect(root.children[1].children[0].value).toBe('const { foo } = bar;');
    });

    it('text identifier', () => {
        const { root } = parseTemplate(`<template>{msg}</template>`);
        expect(root.children[0].value).toBeDefined();
    });

    it('text identifier in text block', () => {
        const { root } = parseTemplate(`<template>Hello {name}, from {location}</template>`);
        expect(root.children[0].value).toBe('Hello ');
        expect(root.children[1].value).toMatchObject(TEMPLATE_IDENTIFIER);
        expect(root.children[2].value).toBe(', from ');
        expect(root.children[3].value).toMatchObject(TEMPLATE_IDENTIFIER);
    });

    it('child elements', () => {
        const { root } = parseTemplate(`<template><ul><li>hello</li></ul></template>`);
        expect(root.children[0].tag).toBe('ul');
        expect(root.children[0].children[0].tag).toBe('li');
        expect(root.children[0].children[0].children[0].value).toBe('hello');
        expect(root.children[0].parent).toBe(root);
    });
});

describe('class and style', () => {
    it('class attribute', () => {
        const { root } = parseTemplate(
            `<template><section class="foo bar   baz-fiz"></section></template>`
        );
        expect(root.children[0].classMap).toMatchObject({ bar: true, foo: true, 'baz-fiz': true });
    });

    it('dynamic class attribute', () => {
        const { root } = parseTemplate(
            `<template><section class={dynamicClass}></section></template>`
        );
        expect(root.children[0].className).toMatchObject({
            type: 'Identifier',
            name: 'dynamicClass',
        });
    });

    it('style attribute', () => {
        const { root } = parseTemplate(`<template>
            <section style="font-size: 12px; color: red; margin: 10px 5px 10px"></section>
        </template>`);
        expect(root.children[0].styleMap).toEqual({
            'font-size': '12px',
            color: 'red',
            margin: '10px 5px 10px',
        });
    });

    it('dynamic style attribute', () => {
        const { root } = parseTemplate(
            `<template><section style={dynamicStyle}></section></template>`
        );
        expect(root.children[0].style).toMatchObject({
            type: 'Identifier',
            name: 'dynamicStyle',
        });
    });
});

describe('event handlers', () => {
    it('event handler attribute', () => {
        const { root } = parseTemplate(
            `<template><h1 onclick={handleClick} onmousemove={handleMouseMove}></h1></template>`
        );
        expect(root.children[0].on).toMatchObject({
            click: { type: 'Identifier', name: 'handleClick' },
            mousemove: { type: 'Identifier', name: 'handleMouseMove' },
        });
    });

    it('event handler attribute', () => {
        const { warnings } = parseTemplate(`<template><h1 onclick="handleClick"></h1></template>`);
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: expect.stringContaining('Event handler should be an expression'),
            location: EXPECTED_LOCATION,
        });
    });
});

describe('for:each directives', () => {
    it('right syntax', () => {
        const { root } = parseTemplate(
            `<template><section for:each={items} for:item="item"></section></template>`
        );
        expect(root.children[0].forEach.expression).toMatchObject({
            type: 'Identifier',
            name: 'items',
        });
        expect(root.children[0].forEach.item).toMatchObject({ type: 'Identifier', name: 'item' });
        expect(root.children[0].forEach.index).toBeUndefined();
    });

    it('right syntax with index', () => {
        const { root } = parseTemplate(
            `<template><section for:each={items} for:item="item" for:index="i"></section></template>`
        );
        expect(root.children[0].forEach.expression).toMatchObject({
            type: 'Identifier',
            name: 'items',
        });
        expect(root.children[0].forEach.item).toMatchObject({ type: 'Identifier', name: 'item' });
        expect(root.children[0].forEach.index).toMatchObject({ type: 'Identifier', name: 'i' });
    });

    it('error missing for:item', () => {
        const { warnings } = parseTemplate(
            `<template><section for:each={items}></section></template>`
        );
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: expect.stringContaining(
                'for:each and for:item directives should be associated together.'
            ),
            location: EXPECTED_LOCATION,
        });
    });

    it('error expression value for for:item', () => {
        const { warnings } = parseTemplate(
            `<template><section for:each={items} for:item={item}></section></template>`
        );
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: expect.stringContaining('for:item directive is expected to be a string.'),
            location: EXPECTED_LOCATION,
        });
    });
});

describe('for:of directives', () => {
    it('right syntax', () => {
        const { root } = parseTemplate(
            `<template><section iterator:it={items}></section></template>`
        );
        expect(root.children[0].forOf.expression).toMatchObject({
            type: 'Identifier',
            name: 'items',
        });
        expect(root.children[0].forOf.iterator).toMatchObject({ type: 'Identifier', name: 'it' });
    });

    it('error expression value for for:iterator', () => {
        const { warnings } = parseTemplate(
            `<template><section iterator:it="items"></section></template>`
        );
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: expect.stringContaining(
                `iterator:it directive is expected to be an expression`
            ),
            location: EXPECTED_LOCATION,
        });
    });
});

describe('if directive', () => {
    it('if directive', () => {
        const { root } = parseTemplate(`<template><h1 if:true={visible}></h1></template>`);
        expect(root.children[0].if).toMatchObject(TEMPLATE_IDENTIFIER);
        expect(root.children[0].ifModifier).toBe('true');
    });

    it('if directive with false modifier', () => {
        const { root } = parseTemplate(`<template><h1 if:false={visible}></h1></template>`);
        expect(root.children[0].if).toMatchObject(TEMPLATE_IDENTIFIER);
        expect(root.children[0].ifModifier).toBe('false');
    });

    it('if directive with unexpecteed modifier', () => {
        const { warnings } = parseTemplate(`<template><h1 if:is-true={visible}></h1></template>`);
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: expect.stringContaining(`Unexpected if modifier is-true`),
            location: EXPECTED_LOCATION,
        });
    });

    it('if directive with with string value', () => {
        const { warnings } = parseTemplate(`<template><h1 if:is-true="visible"></h1></template>`);
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: expect.stringContaining(`If directive should be an expression`),
            location: EXPECTED_LOCATION,
        });
    });
});

describe('custom component', () => {
    it('custom component', () => {
        const { root } = parseTemplate(`<template><x-button></x-button></template>`);
        expect(root.children[0].tag).toBe('x-button');
        expect(root.children[0].component).toBe('x-button');
    });

    it('html element with dashed tag name', () => {
        const { root } = parseTemplate('<template><color-profile></color-profile></template>');
        expect(root.children[0].tag).toBe('color-profile');
        expect(root.children[0].component).toBeUndefined();
    });

    it('custom component self closing error', () => {
        const { warnings } = parseTemplate(`<template><x-button/>Some text</template>`);
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: expect.stringContaining(
                `Invalid HTML syntax: non-void-html-element-start-tag-with-trailing-solidus. For more information, please visit https://html.spec.whatwg.org/multipage/parsing.html#parse-error-non-void-html-element-start-tag-with-trailing-solidus`
            ),
            location: EXPECTED_LOCATION,
        });
    });
});

describe('root errors', () => {
    it('empty template error', () => {
        const { warnings } = parseTemplate('');
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: expect.stringContaining('Missing root template tag'),
            location: EXPECTED_LOCATION,
        });
    });

    it('multi-roots error', () => {
        const { warnings } = parseTemplate(`<template>Root1</template><template>Root2</template>`);
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: expect.stringContaining('Multiple roots found'),
            location: EXPECTED_LOCATION,
        });
    });

    it('missnamed root error', () => {
        const { warnings } = parseTemplate(`<section>Root1</section>`);
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: expect.stringContaining('Expected root tag to be template, found section'),
            location: EXPECTED_LOCATION,
        });
    });

    it('template root with attributes error', () => {
        const { warnings } = parseTemplate(`<template if:true={show}>visible</template>`);
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: expect.stringContaining(`Root template doesn't allow attributes`),
            location: EXPECTED_LOCATION,
        });
    });

    it('disallows is attribute in non-custom component', () => {
        const { warnings } = parseTemplate(`<template>
            <x-menu></x-menu>
            <button is="x-button"></button>
        </template>`);

        expect(warnings).toContainEqual({
            code: expect.any(Number),
            filename: undefined,
            level: DiagnosticLevel.Error,
            message: expect.stringContaining('"is" attribute is disallowed'),
            location: EXPECTED_LOCATION,
        });
    });

    it('disallows <style> tag inside the template', () => {
        const { warnings } = parseTemplate(`<template><style></style></template>`);
        expect(warnings).toEqual([
            {
                code: expect.any(Number),
                level: DiagnosticLevel.Error,
                message: expect.stringContaining(
                    `The <style> element is disallowed inside the template.`
                ),
                location: EXPECTED_LOCATION,
            },
        ]);
    });

    it('disallows nested <style> tag inside the template', () => {
        const { warnings } = parseTemplate(`<template><div><style></style></div></template>`);
        expect(warnings).toEqual([
            {
                code: expect.any(Number),
                level: DiagnosticLevel.Error,
                message: expect.stringContaining(
                    `The <style> element is disallowed inside the template.`
                ),
                location: EXPECTED_LOCATION,
            },
        ]);
    });
});

describe('expression', () => {
    it('forbid reference to this', () => {
        const { warnings } = parseTemplate(`<template><input title={this.title} /></template>`);
        expect(warnings[0]).toMatchObject({
            level: DiagnosticLevel.Error,
            message: `Invalid expression {this.title} - LWC1060: Template expression doesn't allow ThisExpression`,
            location: EXPECTED_LOCATION,
        });
    });

    it('forbid function calls', () => {
        const { warnings } = parseTemplate(`<template><input title={getTitle()} /></template>`);
        expect(warnings[0]).toMatchObject({
            level: DiagnosticLevel.Error,
            message: `Invalid expression {getTitle()} - LWC1060: Template expression doesn't allow CallExpression`,
            location: EXPECTED_LOCATION,
        });
    });

    it('forbid multiple expressions', () => {
        const { warnings } = parseTemplate(`<template><input title={foo;title} /></template>`);
        expect(warnings[0]).toMatchObject({
            level: DiagnosticLevel.Error,
            message: `Invalid expression {foo;title} - LWC1074: Multiple expressions found`,
            location: EXPECTED_LOCATION,
        });
    });

    it('forbids trailing semicolon', () => {
        let result = parseTemplate(`<template>{foo;}</template>`);
        expect(result.warnings[0]).toMatchObject({
            level: DiagnosticLevel.Error,
            message: `Invalid expression {foo;} - LWC1074: Multiple expressions found`,
            location: EXPECTED_LOCATION,
        });

        result = parseTemplate(`<template>{ foo ;   }</template>`);
        expect(result.warnings[0]).toMatchObject({
            level: DiagnosticLevel.Error,
            message: `Invalid expression { foo ;   } - LWC1074: Multiple expressions found`,
            location: EXPECTED_LOCATION,
        });
    });

    it('allows trailing spaces', () => {
        const { warnings } = parseTemplate(`<template>{   foo   }</template>`);
        expect(warnings).toHaveLength(0);
    });

    it('allows parenthesis', () => {
        let result = parseTemplate(`<template>{ ((foo)) }</template>`);
        expect(result.warnings).toHaveLength(0);

        result = parseTemplate(`<template>{ ((foo.bar)) }</template>`);
        expect(result.warnings).toHaveLength(0);

        result = parseTemplate(`<template>{ ((foo).bar) }</template>`);
        expect(result.warnings).toHaveLength(0);
    });

    it('forbid incorrect parenthesis', () => {
        const { warnings } = parseTemplate(`<template>{foo)}</template>`);
        expect(warnings[0]).toMatchObject({
            level: DiagnosticLevel.Error,
            message: `Invalid expression {foo)} - LWC1083: Error parsing template expression: Unexpected end of expression`,
            location: EXPECTED_LOCATION,
        });
    });

    it('forbid empty expression', () => {
        const { warnings } = parseTemplate(`<template>{  }</template>`);
        expect(warnings[0]).toMatchObject({
            level: DiagnosticLevel.Error,
            message: `LWC1083: Error parsing template expression: Invalid expression {  } - Unexpected token (1:3)`,
            location: EXPECTED_LOCATION,
        });
    });

    it('quoted expression ambiguity error', () => {
        const { warnings } = parseTemplate(`<template><input title="{myValue}" /></template>`);
        expect(warnings[0].message).toMatch(`Ambiguous attribute value title="{myValue}"`);
        expect(warnings[0]).toMatchObject({
            location: EXPECTED_LOCATION,
        });
    });

    it('autofix unquoted value next to unary tag', () => {
        const { root } = parseTemplate(`<template><input title={myValue}/></template>`);
        expect(root.children[0].attrs.title).toMatchObject({ value: TEMPLATE_IDENTIFIER });
    });

    it('escaped attribute with curly braces', () => {
        const { root } = parseTemplate(`<template><input title="\\{myValue}"/></template>`);
        expect(root.children[0].attrs.title.value).toBe('{myValue}');
    });

    it('potential expression error', () => {
        const { warnings } = parseTemplate(`<template><input title={myValue}checked /></template>`);
        expect(warnings[0].message).toMatch(`Ambiguous attribute value title={myValue}checked`);
        expect(warnings[0]).toMatchObject({
            location: EXPECTED_LOCATION,
        });
    });
});

describe('props and attributes', () => {
    describe('should throw an error for duplicate static ids', () => {
        it('native element', () => {
            const { warnings } = parseTemplate(`
                <template>
                    <div id="foo"></div>
                    <div id="foo"></div>
                    <div id={baz}></div>
                    <div id={baz}></div>
                </template>
            `);
            expect(warnings.length).toBe(1);
            expect(warnings[0].message).toMatch(
                /Duplicate id value "foo" detected\. Id values must be unique within a template\./
            );
        });
        it('custom element', () => {
            const { warnings } = parseTemplate(`
                <template>
                    <x-foo id="bar"></x-foo>
                    <x-foo id="bar"></x-foo>
                    <x-foo id={baz}></x-foo>
                    <x-foo id={baz}></x-foo>
                </template>
            `);
            expect(warnings.length).toBe(1);
            expect(warnings[0].message).toMatch(
                /Duplicate id value "bar" detected\. Id values must be unique within a template\./
            );
        });
    });

    it('invalid html attribute error', () => {
        const { warnings } = parseTemplate(
            `<template><div minlength="1" maxlength="5"></div></template>`
        );
        expect(warnings[0].message).toMatch(`minlength is not valid attribute for div`);
        expect(warnings[0]).toMatchObject({
            location: EXPECTED_LOCATION,
        });
    });

    it('element specific attribute validation', () => {
        const { root } = parseTemplate(
            `<template><textarea minlength="1" maxlength="5"></textarea></template>`
        );
        expect(root.children[0].attrs).toMatchObject({
            minlength: { value: '1' },
            maxlength: { value: '5' },
        });
    });

    it('global attribute validation', () => {
        const { root } = parseTemplate(
            `<template><p title="title" aria-hidden="true"></p></template>`
        );
        expect(root.children[0].attrs).toMatchObject({
            'aria-hidden': { value: 'true' },
            title: { value: 'title' },
        });
    });

    it('custom element props', () => {
        const { root } = parseTemplate(
            `<template><x-button prop={state.prop}></x-button></template>`
        );
        expect(root.children[0].props.prop).toMatchObject({ value: TEMPLATE_EXPRESSION });
    });

    it('custom element attribute / props mix', () => {
        const { root } = parseTemplate(`<template>
            <x-button class="r"
                data-xx="foo"
                aria-hidden="hidden"
                foo-bar="x"
                foo="bar"
                role="xx"></x-button>
        </template>`);
        expect(root.children[0].props).toMatchObject({
            ariaHidden: { value: 'hidden' },
            fooBar: { value: 'x' },
            foo: { value: 'bar' },
            role: { value: 'xx' },
        });
        expect(root.children[0].attrs).toMatchObject({
            'data-xx': { value: 'foo' },
        });
    });

    describe('attributes with underscores', () => {
        it('should throw when detected an attribute name with underscore + hyphen "_-" combination', () => {
            const { warnings } = parseTemplate(`<template>
                <x-button under_-hyphen="bar"></x-button>
            </template>`);

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message:
                    'LWC1126: under_-hyphen is not valid attribute for x-button. Attribute name cannot contain combination of underscore and special characters.',
            });
        });

        it('should throw when detected an attribute name with hyphen + underscore "-_" combination', () => {
            const { warnings } = parseTemplate(`<template>
                <x-button under-_hyphen="bar"></x-button>
            </template>`);

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message:
                    'LWC1126: under-_hyphen is not valid attribute for x-button. Attribute name cannot contain combination of underscore and special characters.',
            });
        });

        it('should throw when detected an attribute name with a leading underscore', () => {
            const { warnings } = parseTemplate(`<template>
                <x-button _leading="bar"></x-button>
            </template>`);

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message:
                    'LWC1124: _leading is not valid attribute for x-button. Attribute name must start with alphabetic character or a hyphen.',
            });
        });

        it('should throw when detected an attribute name with a trailing underscore', () => {
            const { warnings } = parseTemplate(`<template>
                <x-button trailing_="bar"></x-button>
            </template>`);

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message:
                    'LWC1125: trailing_ is not valid attribute for x-button. Attribute name must end with alpha-numeric character.',
            });
        });

        it('should throw when detected an attribute name separated by underscore that starts with a number', () => {
            const { warnings } = parseTemplate(`<template>
                <x-button 2_under="bar"></x-button>
            </template>`);

            expect(warnings.length).toBe(1);
            expect(warnings[0]).toMatchObject({
                level: DiagnosticLevel.Error,
                message:
                    'LWC1124: 2_under is not valid attribute for x-button. Attribute name must start with alphabetic character or a hyphen.',
            });
        });

        it('attribute name separated by underscore and starts with alphabetic character', () => {
            const { root } = parseTemplate(`<template>
                <x-button under_score="bar"></x-button>
            </template>`);

            expect(root.children[0].props).toMatchObject({
                under_score: { value: 'bar' },
            });
        });

        it('attribute name separated by underscore and starts with a number', () => {
            const { root } = parseTemplate(`<template>
                <x-button under_1="bar"></x-button>
            </template>`);

            expect(root.children[0].props).toMatchObject({
                under_1: { value: 'bar' },
            });
        });

        it('attribute name separated by underscore which contains hyphen', () => {
            const { root } = parseTemplate(`<template>
                <x-button under_score-hyphen="bar"></x-button>
            </template>`);

            expect(root.children[0].props).toMatchObject({
                under_scoreHyphen: { value: 'bar' },
            });
        });

        it('attribute name separated by two underscore and contains hyphen', () => {
            const { root } = parseTemplate(`<template>
                <x-button under_score-second_under-score="bar"></x-button>
            </template>`);

            expect(root.children[0].props).toMatchObject({
                under_scoreSecond_underScore: { value: 'bar' },
            });
        });
    });
});

describe('metadata', () => {
    it('slots', () => {
        const { state } = parseTemplate(`<template>
            <slot></slot>
            <slot name="foo"></slot>
        </template>`);

        expect(Array.from(state.slots)).toEqual(['', 'foo']);
    });
});
