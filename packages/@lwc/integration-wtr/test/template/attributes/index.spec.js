import { createElement } from 'lwc';

import Test from 'x/test';

function testRenderedAttribute(type, value, expectedValue) {
    it(`should render the attribute in the DOM for ${type}`, () => {
        const elm = createElement('x-test', { is: Test });
        elm.attr = value;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('div').getAttribute('title')).toBe(expectedValue);
    });
}

testRenderedAttribute('null', null, null);
testRenderedAttribute('undefined', undefined, null);
testRenderedAttribute('number', 1, '1');
testRenderedAttribute('string', 'foo', 'foo');

it(`should remove the existing attribute if set to null`, async () => {
    const elm = createElement('x-test', { is: Test });
    elm.attr = 'initial value';
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('div').getAttribute('title')).toBe('initial value');

    elm.attr = null;
    await Promise.resolve();
    expect(elm.shadowRoot.querySelector('div').hasAttribute('title')).toBe(false);
    expect(elm.shadowRoot.querySelector('div').getAttribute('title')).toBe(null);
});

it(`should remove the existing attribute if set to undefined`, async () => {
    const elm = createElement('x-test', { is: Test });
    elm.attr = 'initial value';
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('div').getAttribute('title')).toBe('initial value');

    elm.attr = undefined;
    await Promise.resolve();
    expect(elm.shadowRoot.querySelector('div').hasAttribute('title')).toBe(false);
    expect(elm.shadowRoot.querySelector('div').getAttribute('title')).toBe(null);
});
