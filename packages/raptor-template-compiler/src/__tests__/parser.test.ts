import parse from '../parser';

const TEMPLATE_EXPRESSION = { type: 'MemberExpression' };
const TEMPLATE_IDENTIFIER = { type: 'Identifier' };

// Helper function to get a nest property. To avoid insanity type casting:
// expect((((res[0] as ASTElement).children[0] as ASTElement).children[0] as ASTElement)
//          .parent).toBe((res[0] as ASTElement).children[0]);
function get(obj: any, path: string): any {
    const [next, ...res] = path.split('.');
    return next.length ? get(obj[next], res.join('.')) : obj;
}

describe('parsing', () => {
    it('simple parsing', () => {
        const { root } = parse(`<template><h1>hello</h1></template>`);
        expect(get(root, 'tag')).toBe('template');
        expect(get(root, 'children.0.tag')).toBe('h1');
        expect(get(root, 'children.0.children.0.value')).toBe('hello');
    });

    it('html entities', () => {
        const { root } = parse(`<template>
            <p>foo&amp;bar</p>
            <p>const &#123; foo &#125; = bar;</p>
        </template>`);
        expect(get(root, 'children.0.children.0.value')).toBe('foo&bar');
        expect(get(root, 'children.1.children.0.value')).toBe('const { foo } = bar;');
    });

    it('text identifier', () => {
        const { root } = parse(`<template>{msg}</template>`);
        expect(get(root, 'children.0.value')).toBeDefined();
    });

    it('text identifier in text block', () => {
        const { root } = parse(`<template>Hello {name}, from {location}</template>`);
        expect(get(root, 'children.0.value')).toBe('Hello ');
        expect(get(root, 'children.1.value')).toMatchObject(TEMPLATE_IDENTIFIER);
        expect(get(root, 'children.2.value')).toBe(', from ');
        expect(get(root, 'children.3.value')).toMatchObject(TEMPLATE_IDENTIFIER);
    });

    it('child elements', () => {
        const { root } = parse(`<template><ul><li>hello</li></ul></template>`);
        expect(get(root, 'children.0.tag')).toBe('ul');
        expect(get(root, 'children.0.children.0.tag')).toBe('li');
        expect(get(root, 'children.0.children.0.children.0.value')).toBe('hello');
        expect(get(root, 'children.0.parent')).toBe(root);
    });
});

describe('class and style', () => {
    it('class attribute', () => {
        const { root } = parse(`<template><section class="foo bar   baz-fiz"></section></template>`);
        expect(get(root, 'children.0.classMap')).toMatchObject({ 'bar': true, 'foo': true, 'baz-fiz': true });
    });

    it('dynamic class attribute', () => {
        const { root } = parse(`<template><section class={dynamicClass}></section></template>`);
        expect(get(root, 'children.0.className')).toMatchObject({ type: 'Identifier', name: 'dynamicClass' });
    });

    it('style attribute', () => {
        const { root } = parse(`<template>
            <section style="font-size: 12px; color: red; margin: 10px 5px 10px"></section>
        </template>`);
        expect(get(root, 'children.0.style')).toEqual({
            fontSize: '12px',
            color: 'red',
            marginLeft: '5px',
            marginRight: '5px',
            marginTop: '10px',
            marginBottom: '10px',
        });
    });

    it('dynamic style attribute', () => {
        const { warnings } = parse(`<template><section style={dynamicStyle}></section></template>`);
        expect(warnings).toContainEqual({
            level: 'error',
            message: `Dynamic style attribute is not (yet) supported`,
            start: 19,
            length: 20,
        });
    });
});

describe('event handlers', () => {
    it('event handler attribute', () => {
        const { root } = parse(`<template><h1 onclick={handleClick} onmousemove={handleMouseMove}></h1></template>`);
        expect(get(root, 'children.0.on')).toMatchObject({
            click: { type: 'Identifier', name: 'handleClick' },
            mousemove: { type: 'Identifier', name: 'handleMouseMove' },
        });
    });

    it('event handler attribute', () => {
        const { warnings } = parse(`<template><h1 onclick="handleClick"></h1></template>`);
        expect(warnings).toContainEqual({
            level: 'error',
            message: `Event handler should be an expression`,
            start: 14,
            length: 21,
        });
    });
});

describe('for directive', () => {
    it('for directive', () => {
        const { root } = parse(`<template><section for:each="item in items"></section></template>`);
        expect(get(root, 'children.0.for')).toMatchObject({ type: 'Identifier', name: 'items' });
        expect(get(root, 'children.0.forItem')).toMatchObject({ type: 'Identifier', name: 'item' });
        expect(get(root, 'children.0.forIterator')).toMatchObject({ type: 'Identifier', name: 'index' });
    });

    it('for directive with index', () => {
        const { root } = parse(`<template><section for:each="(item, i) in items"></section></template>`);
        expect(get(root, 'children.0.for')).toMatchObject({ type: 'Identifier', name: 'items' });
        expect(get(root, 'children.0.forItem')).toMatchObject({ type: 'Identifier', name: 'item' });
        expect(get(root, 'children.0.forIterator')).toMatchObject({ type: 'Identifier', name: 'i' });
    });

    it('for directive with key', () => {
        const { root } = parse(`<template><section for:each="item in items" key={item.key}></section></template>`);
        expect(get(root, 'children.0.forKey')).toMatchObject(TEMPLATE_EXPRESSION);
    });

    it('for directive invalid syntax errror', () => {
        const { warnings } = parse(`<template><section for:each="item on items"></section></template>`);
        expect(warnings).toContainEqual({
            level: 'error',
            message: `Invalid for syntax "item on items"`,
            start: 19,
            length: 24,
        });
    });

    it('for directive with key text error', () => {
        const { warnings } = parse(`<template><section for:each="item in items" key="item.id"></section></template>`);
        expect(warnings).toContainEqual({
            level: 'error',
            message: `Key attribute value should be an expression`,
            start: 44,
            length: 13,
        });
    });
});

describe('if directive', () => {
    it('if directive', () => {
        const { root } = parse(`<template><h1 if:true={visible}></h1></template>`);
        expect(get(root, 'children.0.if')).toMatchObject(TEMPLATE_IDENTIFIER);
        expect(get(root, 'children.0.ifModifier')).toBe('true');
    });

    it('if directive with false modifier', () => {
        const { root } = parse(`<template><h1 if:false={visible}></h1></template>`);
        expect(get(root, 'children.0.if')).toMatchObject(TEMPLATE_IDENTIFIER);
        expect(get(root, 'children.0.ifModifier')).toBe('false');
    });

    it('if directive with unexpecteed mofidier', () => {
        const { warnings } = parse(`<template><h1 if:is-true={visible}></h1></template>`);
        expect(warnings).toContainEqual({
            level: 'error',
            message: `Unexpected if modifier is-true`,
            start: 14,
            length: 20,
        });
    });

    it('if directive with with string value', () => {
        const { warnings } = parse(`<template><h1 if:is-true="visible"></h1></template>`);
        expect(warnings).toContainEqual({
            level: 'error',
            message: `If directive should be an expression`,
            start: 14,
            length: 20,
        });
    });
});

describe('custom component', () => {
    it('custom component', () => {
        const { root } = parse(`<template><x-button></x-button></template>`);
        expect(get(root, 'children.0.tag')).toBe('x-button');
        expect(get(root, 'children.0.component')).toBe('x-button');
    });

    it('custom component via is attribute', () => {
        const { root } = parse(`<template><button is="x-button"></button></template>`);
        expect(get(root, 'children.0.tag')).toBe('button');
        expect(get(root, 'children.0.component')).toBe('x-button');
    });

    it('is dynamic attribute error', () => {
        const { warnings } = parse(`<template><button is={dynamicCmp}></button></template>`);
        expect(warnings).toContainEqual({
            level: 'error',
            message: `Is attribute value can't be an expression`,
            start: 18,
            length: 15,
        });
    });
});

describe('slots', () => {
    it('default slotset', () => {
        const { root } = parse(`<template>
            <x-card>
                <h1>My title</h1>
                My content
            </x-card>
        </template>`);
        expect(get(root, 'children.0.children')).toHaveLength(0);
        expect(get(root, 'children.0.slotSet.$default$')).toHaveLength(2);
    });

    it('mix default and named slots', () => {
        const { root } = parse(`<template>
            <x-card>
                <h1 slot="title">My title</h1>
                My content
                <section slot="footer">My footer</footer>
            </x-card>
        </template>`);
        expect(get(root, 'children.0.children')).toHaveLength(0);
        expect(get(root, 'children.0.slotSet.title')).toHaveLength(1);
        expect(get(root, 'children.0.slotSet.$default$')).toHaveLength(1);
        expect(get(root, 'children.0.slotSet.footer')).toHaveLength(1);
    });

    it('default slot', () => {
        const { root } = parse(`<template><slot></slot></template>`);
        expect(get(root, 'children.0.slotName')).toBe('$default$');
    });

    it('named slot', () => {
        const { root } = parse(`<template><slot name="title"></slot></button></template>`);
        expect(get(root, 'children.0.slotName')).toBe('title');
    });
});

describe('root errors', () => {
    it('empty template error', () => {
        const { warnings } = parse('');
        expect(warnings).toContainEqual({
            level: 'error',
            message: 'Missing root template tag',
            start: 0,
            length: 0,
        });
    });

    it('multi-roots error', () => {
        const { warnings } = parse(`<template>Root1</template><template>Root2</template>`);
        expect(warnings).toContainEqual({
            level: 'error',
            message: 'Multiple roots found',
            start: 26,
            length: 26,
        });
    });

    it('missing root error', () => {
        const { warnings } = parse(`<section>Root1</section>`);
        expect(warnings).toContainEqual({
            level: 'error',
            message: 'Missing root template tag',
            start: 0,
            length: 0,
        });
    });

    it('template root with attributes error', () => {
        const { warnings } = parse(`<template if:true={show}>visible</template>`);
        expect(warnings).toContainEqual({
            level: 'error',
            message: `Root template doesn't allow attributes`,
            start: 0,
            length: 43,
        });
    });
});

describe('expression', () => {
    it('forbid reference to this', () => {
        const { warnings } = parse(`<template><input title={this.title} /></template>`);
        expect(warnings[0]).toMatchObject({
            level: 'error',
            message: `Invalid expression {this.title} - Template expression doens't allow ThisExpression`,
            start: 17,
            length: 18,
        });
    });

    it('forbid function calls', () => {
        const { warnings } = parse(`<template><input title={getTitle()} /></template>`);
        expect(warnings[0]).toMatchObject({
            level: 'error',
            message: `Invalid expression {getTitle()} - Template expression doens't allow CallExpression`,
            start: 17,
            length: 18,
        });
    });

    it('forbid multiple expressions', () => {
        const { warnings } = parse(`<template><input title={foo;title} /></template>`);
        expect(warnings[0]).toMatchObject({
            level: 'error',
            message: `Invalid expression {foo;title} - Multiple expressions found`,
            start: 17,
            length: 17,
        });
    });

    it('quoted expression ambiguity error', () => {
        const { warnings } = parse(`<template><input title="{myValue}" /></template>`);
        expect(warnings[0].message).toMatch(`Ambiguous attribute value title="{myValue}"`);
        expect(warnings[0]).toMatchObject({
            start: 17,
            length: 17,
        });
    });

    it('autofix unquoted value next to unary tag', () => {
        const { root } = parse(`<template><input title={myValue}/></template>`);
        expect(get(root, 'children.0.attrs.title')).toMatchObject(TEMPLATE_IDENTIFIER);
    });

    // FIXME
    it.skip('escaped attribute with curly braces', () => {
        const { root } = parse(`<template><input title="\\{myValue}"/></template>`);
        expect(get(root, 'children.0.attrs.title')).toBe('{myValue}');
    });

    it('potential expression error', () => {
        const { warnings } = parse(`<template><input title={myValue}checked /></template>`);
        expect(warnings[0].message).toMatch(`Ambiguous attribute value title={myValue}checked`);
        expect(warnings[0]).toMatchObject({
            start: 17,
            length: 22,
        });
    });
});

describe('props and attributes', () => {
    it('invalid html attribute error', () => {
        const { warnings } = parse(`<template><div minlength="1" maxlength="5"></div></template>`);
        expect(warnings[0].message).toMatch(`minlength is not valid attribute for div`);
        expect(warnings[0]).toMatchObject({
            start: 15,
            length: 13,
        });
    });

    it('element specific attribute validation', () => {
        const { root } = parse(`<template><textarea minlength="1" maxlength="5"></textarea></template>`);
        expect(get(root, 'children.0.attrs')).toEqual({
            minlength: '1',
            maxlength: '5',
        });
    });

    it('global attribute validation', () => {
        const { root } = parse(`<template><p title="title" aria-hidden="true"></p></template>`);
        expect(get(root, 'children.0.attrs')).toEqual({
            'title': 'title',
            'aria-hidden': 'true',
        });
    });

    it('custom element props', () => {
        const { root } = parse(`<template><x-button prop={state.prop}></x-button></template>`);
        expect(get(root, 'children.0.props.prop')).toMatchObject(TEMPLATE_EXPRESSION);
    });

    it('custom element attribute / props mix', () => {
        const { root } = parse(`<template>
            <x-button class="r"
                data-xx="foo"
                aria-hidden="hidden"
                foo-bar="x"
                foo="bar"
                role="xx"></x-button>
        </template>`);
        expect(get(root, 'children.0.props')).toEqual({
            fooBar: 'x',
            foo: 'bar',
        });
        expect(get(root, 'children.0.attrs')).toEqual({
            'data-xx': 'foo',
            'aria-hidden': 'hidden',
            'role': 'xx',
        });
    });

    it('custom element using is with attribute / prop mix', () => {
        const { root } = parse(`<template>
            <table bgcolor="x" is="x-table" tabindex="2" bar="test" min="3"></table>
        </template>`);

        expect(get(root, 'children.0.props')).toEqual({
            bar: 'test',
            min: '3',
        });
        expect(get(root, 'children.0.attrs')).toEqual({
            bgcolor: 'x',
            is: 'x-table',
            tabindex: '2',
        });
    });
});

describe('metadata', () => {
    it('usedIds simple', () => {
        const { metadata } = parse(`<template><h1 if:true={visible} class={titleClass}>{text}</h1></template>`);
        expect(Array.from(metadata.templateUsedIds)).toEqual(['visible', 'titleClass', 'text']);
    });

    it('usedIds with expression', () => {
        const { metadata } = parse(`<template>
            <div for:each="item of state.items">
                <template if:true={item.visible}>
                    {componentProp} - {item.value}
                </template>
            </div>
        </template>`);
        expect(Array.from(metadata.templateUsedIds)).toEqual(['state', 'componentProp']);
    });

    it('dependent component', () => {
        const { metadata } = parse(`<template>
            <x-menu></x-menu>
            <button is="x-button"></button>
        </template>`);

        expect(Array.from(metadata.templateDependencies)).toEqual(['x-menu', 'x-button']);
    });

    it('slots', () => {
        const { metadata } = parse(`<template>
            <slot></slot>
            <slot name="foo"></slot>
        </template>`);

        expect(Array.from(metadata.definedSlots)).toEqual(['$default$', 'foo']);
    });
});
