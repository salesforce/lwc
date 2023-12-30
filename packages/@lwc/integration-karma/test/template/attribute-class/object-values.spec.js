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

function testClassNameValueUpdate(name, valueFn, updateFn, expected) {
    it(name, () => {
        const original = valueFn();
        const { host, target } = createDynamicClass(original);

        const updated = updateFn(original);
        host.dynamicClass = updated;

        return Promise.resolve().then(() => {
            expect(target.className).toBe(expected);
        });
    });
}

describe('plain object class value', () => {
    testClassNameValue('empty', {}, '');
    testClassNameValue('single class', { foo: true }, 'foo');
    testClassNameValue('multiple classes', { foo: true, bar: true }, 'foo bar');

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

    it('throws on invalid css token', () => {
        expect(() => createDynamicClass({ 'foo bar': true })).toThrowCallbackReactionError();
    });
});

describe('array class value', () => {
    testClassNameValue('empty', [], '');
    testClassNameValue('single class', ['foo'], 'foo');
    testClassNameValue('multiple classes', ['foo', 'bar'], 'foo bar');

    testClassNameValue('with falsy values', [0, '', null, undefined, NaN, -0], '');
    testClassNameValue('with nested mixed values', ['foo', ['bar'], { baz: true }], 'foo bar baz');
});

describe('object class value update', () => {
    testClassNameValueUpdate(
        'update to empty',
        () => ({ foo: true }),
        () => ({}),
        ''
    );
    testClassNameValueUpdate(
        'update to partial replacement',
        () => ({ foo: true, bar: true, baz: false }),
        () => ({ bar: false, baz: true }),
        'baz'
    );
    testClassNameValueUpdate(
        'object to string',
        () => ({ foo: true }),
        () => 'bar',
        'bar'
    );
    testClassNameValueUpdate(
        'string to object',
        () => 'foo',
        () => ({ bar: true }),
        'bar'
    );
    testClassNameValueUpdate(
        'object to array',
        () => ({ foo: true, bar: false, baz: true }),
        () => [{ foo: true }, 'bar', ['baz']],
        'foo baz bar'
    );
    testClassNameValueUpdate(
        'update original object',
        () => ({ foo: true, bar: true }),
        (original) => {
            original.foo = false;
            delete original.bar;
            original.baz = true;

            return original;
        },
        'baz'
    );
    testClassNameValueUpdate(
        'update original array',
        () => ['foo', { bar: true }, 'baz'],
        (original) => {
            original[0] = 'fooz';
            original[1].fiz = true;
            original.push('biz');

            return original;
        },
        'bar baz fooz fiz biz'
    );
});

describe('reactive object update', () => {
    it('updates when a property is added', () => {
        const elm = createElement('x-reactive', { is: Reactive });
        elm.updateDynamicClass((obj) => (obj.foo = true));
        document.body.appendChild(elm);

        const target = elm.shadowRoot.querySelector('div');
        expect(target.className).toBe('foo');

        // 🛑 This doesn't work now, because the diffing algo access properties on the reactive object
        // during patching which isn't currently tracked. 🛑
        elm.updateDynamicClass((obj) => (obj.bar = true));
        return Promise.resolve().then(() => {
            expect(target.className).toBe('foo bar');
        });
    });

    it('updates when a property is removed', () => {
        const elm = createElement('x-reactive', { is: Reactive });
        elm.updateDynamicClass((obj) => (obj.foo = true));
        document.body.appendChild(elm);

        const target = elm.shadowRoot.querySelector('div');
        expect(target.className).toBe('foo');

        elm.updateDynamicClass((obj) => delete obj.foo);
        return Promise.resolve().then(() => {
            expect(target.className).toBe('');
        });
    });
});
