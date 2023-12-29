import { createElement } from 'lwc';

import Dynamic from 'x/dynamic';

function createDynamicClass(value) {
    const elm = createElement('x-dynamic', { is: Dynamic });
    elm.dynamicClass = value;
    document.body.appendChild(elm);

    return {
        host: elm,
        target: elm.shadowRoot.querySelector('div'),
    };
}

function testClassNameValue(name, value, expected) {
    it(name, () => {
        const { target } = createDynamicClass(value);
        expect(target.className).toBe(expected);
    });
}

describe('object class value', () => {
    testClassNameValue('empty', {}, '');
    testClassNameValue('single class', { foo: true }, 'foo');
    testClassNameValue('multiple classes', { foo: true, bar: true }, 'foo bar');

    testClassNameValue(
        'with truthy values',
        { foo: 1, bar: 'not-empty', baz: {}, buz: [] },
        'foo bar baz buz'
    );
    testClassNameValue(
        'with falsy values',
        { foo: 0, bar: '', baz: null, buz: undefined, biz: NaN, fiz: -0 },
        ''
    );

    testClassNameValue('with symbols', { [Symbol('foo')]: true }, '');
    testClassNameValue('with null proto', Object.create(null), '');

    xit('accepts inconsistent spacing??', () => {
        // TODO [#000]: Determine what we want to do in the case.
        const { target } = createDynamicClass({ '  foo   bar': true, baz: true });
        expect(target.className).toBe('foo bar baz');
    });
});

describe('array class value', () => {
    testClassNameValue('empty', [], '');
    testClassNameValue('single class', ['foo'], 'foo');
    testClassNameValue('multiple classes', ['foo', 'bar'], 'foo bar');

    testClassNameValue('with falsy values', [0, '', null, undefined, NaN, -0], '');
    testClassNameValue('with nested mixed values', ['foo', ['bar'], { baz: true }], 'foo bar baz');
});
