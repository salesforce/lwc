/* tslint:disable:max-line-length */

import { mergeConfig } from '../config';
import State from '../state';
import parse from '../parser';

import { DiagnosticLevel } from 'lwc-errors';

const TEMPLATE_EXPRESSION = { type: 'MemberExpression' };
const TEMPLATE_IDENTIFIER = { type: 'Identifier' };

const EXPECTED_LOCATION = expect.objectContaining({
    line: expect.any(Number),
    column: expect.any(Number)
});

function parseTemplate(src: string): any {
    const config = mergeConfig({});
    const state = new State(src, config);

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
        const { root } = parseTemplate(`<template><section class="foo bar   baz-fiz"></section></template>`);
        expect(root.children[0].classMap).toMatchObject({ 'bar': true, 'foo': true, 'baz-fiz': true });
    });

    it('dynamic class attribute', () => {
        const { root } = parseTemplate(`<template><section class={dynamicClass}></section></template>`);
        expect(root.children[0].className).toMatchObject({ type: 'Identifier', name: 'dynamicClass' });
    });

    it('style attribute', () => {
        const { root } = parseTemplate(`<template>
            <section style="font-size: 12px; color: red; margin: 10px 5px 10px"></section>
        </template>`);
        expect(root.children[0].styleMap).toEqual({
            fontSize: '12px',
            color: 'red',
            margin: '10px 5px 10px'
        });
    });

    it('dynamic style attribute', () => {
        const { root } = parseTemplate(`<template><section style={dynamicStyle}></section></template>`);
        expect(root.children[0].style).toMatchObject({
            type: 'Identifier',
            name: 'dynamicStyle',
        });
    });
});

describe('event handlers', () => {
    it('event handler attribute', () => {
        const { root } = parseTemplate(`<template><h1 onclick={handleClick} onmousemove={handleMouseMove}></h1></template>`);
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
            message: `LWC1: Event handler should be an expression`,
            location: EXPECTED_LOCATION
        });
    });
});

describe('for:each directives', () => {
    it('right syntax', () => {
        const { root } = parseTemplate(`<template><section for:each={items} for:item="item"></section></template>`);
        expect(root.children[0].forEach.expression).toMatchObject({ type: 'Identifier', name: 'items' });
        expect(root.children[0].forEach.item).toMatchObject({ type: 'Identifier', name: 'item' });
        expect(root.children[0].forEach.index).toBeUndefined();
    });

    it('right syntax with index', () => {
        const { root } = parseTemplate(`<template><section for:each={items} for:item="item" for:index="i"></section></template>`);
        expect(root.children[0].forEach.expression).toMatchObject({ type: 'Identifier', name: 'items' });
        expect(root.children[0].forEach.item).toMatchObject({ type: 'Identifier', name: 'item' });
        expect(root.children[0].forEach.index).toMatchObject({ type: 'Identifier', name: 'i' });
    });

    it('error missing for:item', () => {
        const { warnings } = parseTemplate(`<template><section for:each={items}></section></template>`);
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: `LWC1: for:each and for:item directives should be associated together.`,
            location: EXPECTED_LOCATION
        });
    });

    it('error expression value for for:item', () => {
        const { warnings } = parseTemplate(`<template><section for:each={items} for:item={item}></section></template>`);
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: `LWC1: for:item directive is expected to be a string.`,
            location: EXPECTED_LOCATION
        });
    });
});

describe('for:of directives', () => {
    it('right syntax', () => {
        const { root } = parseTemplate(`<template><section iterator:it={items}></section></template>`);
        expect(root.children[0].forOf.expression).toMatchObject({ type: 'Identifier', name: 'items' });
        expect(root.children[0].forOf.iterator).toMatchObject({ type: 'Identifier', name: 'it' });
    });

    it('error expression value for for:iterator', () => {
        const { warnings } = parseTemplate(`<template><section iterator:it="items"></section></template>`);
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: `LWC1: iterator:it directive is expected to be an expression`,
            location: EXPECTED_LOCATION
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

    it('if directive with unexpecteed mofidier', () => {
        const { warnings } = parseTemplate(`<template><h1 if:is-true={visible}></h1></template>`);
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: `LWC1: Unexpected if modifier is-true`,
            location: EXPECTED_LOCATION
        });
    });

    it('if directive with with string value', () => {
        const { warnings } = parseTemplate(`<template><h1 if:is-true="visible"></h1></template>`);
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: `LWC1: If directive should be an expression`,
            location: EXPECTED_LOCATION
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
            message: `LWC1: Invalid HTML syntax: non-void-html-element-start-tag-with-trailing-solidus. For more information, please visit https://html.spec.whatwg.org/multipage/parsing.html#parse-error-non-void-html-element-start-tag-with-trailing-solidus`,
            location: EXPECTED_LOCATION
        });
    });

    it('custom component via is attribute', () => {
        const { root } = parseTemplate(`<template><button is="x-button"></button></template>`);
        expect(root.children[0].tag).toBe('button');
        expect(root.children[0].component).toBe('x-button');
    });

    it('is dynamic attribute error', () => {
        const { warnings } = parseTemplate(`<template><button is={dynamicCmp}></button></template>`);
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: `LWC1: Is attribute value can't be an expression`,
            location: EXPECTED_LOCATION
        });
    });
});

describe('root errors', () => {
    it('empty template error', () => {
        const { warnings } = parseTemplate('');
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: 'LWC1: Missing root template tag',
            location: EXPECTED_LOCATION
        });
    });

    it('multi-roots error', () => {
        const { warnings } = parseTemplate(`<template>Root1</template><template>Root2</template>`);
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: 'LWC1: Multiple roots found',
            location: EXPECTED_LOCATION
        });
    });

    it('missnamed root error', () => {
        const { warnings } = parseTemplate(`<section>Root1</section>`);
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: 'LWC1: Expected root tag to be template, found section',
            location: EXPECTED_LOCATION
        });
    });

    it('template root with attributes error', () => {
        const { warnings } = parseTemplate(`<template if:true={show}>visible</template>`);
        expect(warnings).toContainEqual({
            code: expect.any(Number),
            level: DiagnosticLevel.Error,
            message: `LWC1: Root template doesn't allow attributes`,
            location: EXPECTED_LOCATION
        });
    });
});

describe('expression', () => {
    it('forbid reference to this', () => {
        const { warnings } = parseTemplate(`<template><input title={this.title} /></template>`);
        expect(warnings[0]).toMatchObject({
            level: DiagnosticLevel.Error,
            message: `Invalid expression {this.title} - LWC1: Template expression doesn't allow ThisExpression`,
            location: EXPECTED_LOCATION
        });
    });

    it('forbid function calls', () => {
        const { warnings } = parseTemplate(`<template><input title={getTitle()} /></template>`);
        expect(warnings[0]).toMatchObject({
            level: DiagnosticLevel.Error,
            message: `Invalid expression {getTitle()} - LWC1: Template expression doesn't allow CallExpression`,
            location: EXPECTED_LOCATION
        });
    });

    it('forbid multiple expressions', () => {
        const { warnings } = parseTemplate(`<template><input title={foo;title} /></template>`);
        expect(warnings[0]).toMatchObject({
            level: DiagnosticLevel.Error,
            message: `Invalid expression {foo;title} - LWC1: Multiple expressions found`,
            location: EXPECTED_LOCATION
        });
    });

    it('quoted expression ambiguity error', () => {
        const { warnings } = parseTemplate(`<template><input title="{myValue}" /></template>`);
        expect(warnings[0].message).toMatch(`Ambiguous attribute value title="{myValue}"`);
        expect(warnings[0]).toMatchObject({
            location: EXPECTED_LOCATION
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
            location: EXPECTED_LOCATION
        });
    });
});

describe('props and attributes', () => {
    describe('attributes that must have static values', () => {
        it('should restrict usage of dynamic attributes', () => {
            const { warnings } = parseTemplate(`
                <template>
                    <div id={foo}></div>
                    <label for={foo}></label>
                    <div aria-activedescendant={foo}></div>
                    <div aria-controls={foo}></div>
                    <div aria-describedby={foo}></div>
                    <div aria-details={foo}></div>
                    <div aria-errormessage={foo}></div>
                    <div aria-flowto={foo}></div>
                    <div aria-labelledby={foo}></div>
                    <div aria-owns={foo}></div>
                    <x-foo id={foo}></x-foo>
                    <x-foo aria-owns={foo}></x-foo>
                </template>
            `);
            expect(warnings.length).toBe(12);

            const MESSAGE_RE = /^LWC1: The attribute "[\w-]+" cannot be an expression\. It must be a static string value\.$/;
            for (const { message } of warnings) {
                expect(message).toMatch(MESSAGE_RE);
            }
        });

        it('should restrict usage of empty string values', () => {
            const { warnings } = parseTemplate(`
                <template>
                    <div id=""></div>
                    <label for=""></label>
                    <div aria-activedescendant=""></div>
                    <div aria-controls=""></div>
                    <div aria-describedby=""></div>
                    <div aria-details=""></div>
                    <div aria-errormessage=""></div>
                    <div aria-flowto=""></div>
                    <div aria-labelledby=""></div>
                    <div aria-owns=""></div>
                    <x-foo aria-owns=""></x-foo>
                </template>
            `);
            expect(warnings.length).toBe(11);

            const MESSAGE_RE = /^LWC1: The attribute "[\w-]+" cannot be an empty string\. Remove the attribute if it is unnecessary\.$/;
            for (const { message } of warnings) {
                expect(message).toMatch(MESSAGE_RE);
            }
        });

        it('should not restrict usage of static values', () => {
            const { warnings } = parseTemplate(`
                <template>
                    <div id="foo"></div>
                    <div id="bar"></div>
                    <div id="baz"></div>
                    <label for="foo"></label>
                    <div aria-activedescendant="foo"></div>
                    <div aria-controls="foo"></div>
                    <div aria-describedby="foo bar baz"></div>
                    <div aria-details="foo"></div>
                    <div aria-errormessage="foo"></div>
                    <div aria-flowto="foo"></div>
                    <div aria-labelledby="foo bar baz"></div>
                    <div aria-owns="foo"></div>
                    <x-foo id="boof"></x-foo>
                    <x-foo aria-owns="boof"></x-foo>
                </template>
            `);
            expect(warnings.length).toBe(0);
        });
    });

    it('invalid html attribute error', () => {
        const { warnings } = parseTemplate(`<template><div minlength="1" maxlength="5"></div></template>`);
        expect(warnings[0].message).toMatch(`minlength is not valid attribute for div`);
        expect(warnings[0]).toMatchObject({
            location: EXPECTED_LOCATION
        });
    });

    it('element specific attribute validation', () => {
        const { root } = parseTemplate(`<template><textarea minlength="1" maxlength="5"></textarea></template>`);
        expect(root.children[0].attrs).toMatchObject({
            minlength: { value: '1' },
            maxlength: { value: '5' },
        });
    });

    it('global attribute validation', () => {
        const { root } = parseTemplate(`<template><p title="title" aria-hidden="true"></p></template>`);
        expect(root.children[0].attrs).toMatchObject({
            'aria-hidden': { value: 'true' },
            'title': { value: 'title' },
        });
    });

    it('custom element props', () => {
        const { root } = parseTemplate(`<template><x-button prop={state.prop}></x-button></template>`);
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

    it('custom element using is with attribute / prop mix', () => {
        const { root } = parseTemplate(`<template>
            <table bgcolor="x" is="x-table" tabindex="2" bar="test" min="3"></table>
        </template>`);
        expect(root.children[0].props).toMatchObject({
            bar: { value: 'test' },
            min: { value: '3' },
            bgColor: { value: 'x' },
            tabIndex: { value: '2' },
        });
        expect(root.children[0].attrs).toMatchObject({
            is: { value: 'x-table' },
        });
    });
});

describe('metadata', () => {
    it('usedIds simple', () => {
        const { state } = parseTemplate(`<template><h1 if:true={visible} class={titleClass}>{text}</h1></template>`);
        expect(Array.from(state.ids)).toEqual(['visible', 'titleClass', 'text']);
    });

    it('usedIds with expression', () => {
        const { state } = parseTemplate(`<template>
            <div for:each={state.items} for:item="item">
                <template if:true={item.visible}>
                    {componentProp} - {item.value}
                </template>
            </div>
        </template>`);
        expect(Array.from(state.ids)).toEqual(['state', 'componentProp']);
    });

    it('dependent component', () => {
        const { state } = parseTemplate(`<template>
            <x-menu></x-menu>
            <button is="x-button"></button>
        </template>`);

        expect(Array.from(state.dependencies)).toEqual(['x-menu', 'x-button']);
    });

    it('slots', () => {
        const { state } = parseTemplate(`<template>
            <slot></slot>
            <slot name="foo"></slot>
        </template>`);

        expect(Array.from(state.slots)).toEqual(['', 'foo']);
    });

    describe('Alternative Template Dependencies', () => {
        it('returns transformed parameters for special attributes', () => {
            const { state } = parseTemplate(`<template>
           <x-foo aria-describedby="label" readonly></x-foo>
       </template>`);
            expect(state.extendedDependencies).toEqual([
                {
                    properties: {
                        ariaDescribedBy: {
                            type: 'literal',
                            value: 'label'
                        },
                        readOnly: {
                            type: 'literal',
                            value: true
                        }
                    },
                    moduleName: 'x/foo',
                    tagName: 'x-foo',
                }
            ]);
        });

        it('ignores attributes such as class, data-*', () => {
            const { state } = parseTemplate(`<template>
           <x-foo class="foo" data-foo="data"></x-foo>
       </template>`);
            expect(state.extendedDependencies).toEqual([
                {
                    moduleName: 'x/foo',
                    tagName: 'x-foo',
                }
            ]);
        });

        it('returns literals in parameters', () => {
            const { state } = parseTemplate(`<template>
           <x-foo my-string="123" my-boolean></x-foo>
       </template>`);
            expect(state.extendedDependencies).toEqual([
                {
                    properties: {
                        myBoolean: {
                            type: 'literal',
                            value: true
                        },
                        myString: {
                            type: 'literal',
                            value: '123'
                        }
                    },
                    moduleName: 'x/foo',
                    tagName: 'x-foo'
                }
            ]);
        });

        it('returns parameters for member expressions', () => {
            const { state } = parseTemplate(`<template>
           <x-foo parameter={p1.level1.level2}></x-foo>
       </template>`);
            expect(state.extendedDependencies).toEqual([
                {
                    properties: {
                        parameter: {
                            type: 'expression',
                            value: 'p1.level1.level2'
                        }
                    },
                    moduleName: 'x/foo',
                    tagName: 'x-foo',
                }
            ]);
        });

        it('returns parameters for statement expression', () => {
            const { state } = parseTemplate(`<template>
           <x-foo property={p1}></x-foo>
       </template>`);
            expect(state.extendedDependencies).toEqual([
                {
                    properties: {
                        property: {
                            type: 'expression',
                            value: 'p1'
                        }
                    },
                    moduleName: 'x/foo',
                    tagName: 'x-foo'
                }
            ]);
        });
    });
});
