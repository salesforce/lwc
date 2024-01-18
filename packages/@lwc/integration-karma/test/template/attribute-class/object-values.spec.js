import { createElement } from 'lwc';

import Dynamic from 'x/dynamic';
import Reactive from 'x/reactive';

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

function testReactiveClassNameValue(name, setupFn, updateFn, expected) {
    it(name, () => {
        const elm = createElement('x-reactive', { is: Reactive });
        elm.updateDynamicClass(setupFn);
        document.body.appendChild(elm);

        const target = elm.shadowRoot.querySelector('div');

        elm.updateDynamicClass(updateFn);
        return Promise.resolve().then(() => {
            expect(target.className).toBe(expected);
        });
    });
}

if (process.env.API_VERSION >= 61) {
    describe('plain object class value', () => {
        testClassNameValue('empty', {}, '');
        testClassNameValue('single class', { foo: true }, 'foo');
        testClassNameValue('multiple classes', { foo: true, bar: true }, 'foo bar');
        testClassNameValue('complex classes', { 'foo bar': true }, 'foo bar');

        testClassNameValue(
            'truthy values',
            { foo: 1, bar: 'not-empty', baz: {}, buz: [] },
            'foo bar baz buz'
        );
        testClassNameValue(
            'falsy values',
            { foo: 0, bar: '', baz: null, buz: undefined, biz: NaN, fiz: -0 },
            ''
        );

        testClassNameValue('symbols keys', { [Symbol('foo')]: true }, '');
        testClassNameValue('null proto', Object.create(null), '');
    });

    describe('array class value', () => {
        testClassNameValue('empty', [], '');
        testClassNameValue('single class', ['foo'], 'foo');
        testClassNameValue('multiple classes', ['foo', 'bar'], 'foo bar');

        testClassNameValue('with falsy values', [0, '', null, undefined, NaN, -0], '');
        testClassNameValue(
            'with nested mixed values',
            ['foo', ['bar'], { baz: true }],
            'foo bar baz'
        );
    });

    describe('edge cases values', () => {
        testClassNameValue('null', null, '');
        testClassNameValue('undefined', undefined, '');
        testClassNameValue('number', 1, '');
        testClassNameValue('symbol', Symbol(), '');
        testClassNameValue('map', new Map(), '');
        testClassNameValue('function', function () {}, '');
    });

    describe('reactive object update', () => {
        // This is a caveat of the current implementation, we don't support adding new properties. The
        // workaround is to always return a new object or define all the properties upfront.
        testReactiveClassNameValue(
            'ignores newly added properties',
            (obj) => (obj.foo = true),
            (obj) => (obj.bar = true),
            'foo'
        );

        testReactiveClassNameValue(
            'updates when a property is updated',
            (obj) => {
                obj.foo = true;
                obj.bar = true;
            },
            (obj) => (obj.foo = false),
            'bar'
        );

        testReactiveClassNameValue(
            'updates when a property is removed',
            (obj) => {
                obj.foo = true;
                obj.bar = true;
            },
            (obj) => delete obj.foo,
            'bar'
        );
    });
}
