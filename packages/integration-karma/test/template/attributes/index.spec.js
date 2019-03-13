import { createElement } from 'test-utils';

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

function testUnrenderAttribute(type, value) {
    it(`should remove the existing attribute if set to ${type}`, () => {
        const elm = createElement('x-test', { is: Test });
        elm.attr = 'initial value';
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('div').getAttribute('title')).toBe('initial value');

        elm.attr = value;
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('div').hasAttribute('title')).toBe(false);
            expect(elm.shadowRoot.querySelector('div').getAttribute('title')).toBe(null);
        });
    });
}

testUnrenderAttribute('null', null);

// TODO: open issue for undefined inconsistent behavior with initial value
// testUnrenderAttribute('undefined', undefined);
