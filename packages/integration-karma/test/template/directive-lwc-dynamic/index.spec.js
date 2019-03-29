import { createElement } from 'test-utils';

import Dynamic from 'x/dynamic';
import Foo from 'x/foo';
import Bar from 'x/bar';

it('should not render a component is the constructor is not passed', () => {
    const elm = createElement('x-dynamic', { is: Dynamic });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('x-placeholder')).toBe(null);

    elm.ctor = Foo;
    return Promise.resolve().then(() => {
        expect(elm.shadowRoot.querySelector('x-placeholder')).not.toBe(null);
    });
});

it('should unrender the component when the constructor is set to undefined', () => {
    const elm = createElement('x-dynamic', { is: Dynamic });
    elm.ctor = Foo;
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('x-placeholder')).not.toBe(null);

    elm.ctor = undefined;
    return Promise.resolve().then(() => {
        expect(elm.shadowRoot.querySelector('x-placeholder')).toBe(null);
    });
});

it('should recreate the component when the constructor changes', () => {
    const elm = createElement('x-dynamic', { is: Dynamic });
    elm.props = { value: 'test' };
    document.body.appendChild(elm);

    elm.ctor = Foo;
    return Promise.resolve()
        .then(() => {
            expect(elm.shadowRoot.querySelector('x-placeholder')).not.toBe(null);
            expect(elm.shadowRoot.querySelector('x-placeholder').shadowRoot.textContent).toBe(
                'foo: test'
            );

            elm.ctor = Bar;
        })
        .then(() => {
            expect(elm.shadowRoot.querySelector('x-placeholder')).not.toBe(null);
            expect(elm.shadowRoot.querySelector('x-placeholder').shadowRoot.textContent).toBe(
                'foo: bar'
            );
        });
});

it('should allow passing the props', () => {
    const elm = createElement('x-dynamic', { is: Dynamic });
    elm.ctor = Foo;
    elm.props = { value: 'test' };
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('x-placeholder').shadowRoot.textContent).toBe('foo: test');
});

it('should updating props', () => {
    const elm = createElement('x-dynamic', { is: Dynamic });
    elm.ctor = Foo;
    elm.props = { value: '1' };
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('x-placeholder').shadowRoot.textContent).toBe('foo: 1');

    elm.props = { value: '2' };
    return Promise.resolve().then(() => {
        expect(elm.shadowRoot.querySelector('x-placeholder').shadowRoot.textContent).toBe('foo: 2');
    });
});
