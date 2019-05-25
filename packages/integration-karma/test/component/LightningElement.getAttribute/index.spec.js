import { createElement } from 'lwc';

import Test from 'x/test';

function testInvalidProperty(type, name) {
    it(`should return null when passing an invalid attribute name ${type}`, () => {
        const elm = createElement('x-test', { is: Test });
        expect(elm.getComponentAttribute(name)).toBe(null);
    });
}

testInvalidProperty('null', null);
testInvalidProperty('undefined', undefined);
testInvalidProperty('empty string', '');
testInvalidProperty('number', 1);

it('should return attribute on the host element', () => {
    const elm = createElement('x-test', { is: Test });
    elm.setAttribute('foo', 'bar');

    expect(elm.getComponentAttribute('foo')).toBe('bar');
});

it('should normalize the attribute name to lowercase', () => {
    const elm = createElement('x-test', { is: Test });
    elm.setAttribute('foo', 'bar');

    expect(elm.getComponentAttribute('FOO')).toBe('bar');
});
