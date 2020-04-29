import { createElement } from 'lwc';

import Test from 'x/test';

function testInvalidProperty(type, name) {
    it(`should return false when when passing the invalid attribute name "${type}"`, () => {
        const elm = createElement('x-test', { is: Test });
        expect(elm.hasComponentAttribute(name)).toBeFalse();
    });
}

testInvalidProperty('null', null);
testInvalidProperty('undefined', undefined);
testInvalidProperty('empty string', '');
testInvalidProperty('number', 1);

it('should have access to attribute on the host element', () => {
    const elm = createElement('x-test', { is: Test });
    elm.setAttribute('foo', 'bar');

    expect(elm.hasComponentAttribute('foo')).toBeTrue();
});

it('should normalize the attribute name to lowercase', () => {
    const elm = createElement('x-test', { is: Test });
    elm.setAttribute('foo', 'bar');

    expect(elm.hasComponentAttribute('FOO')).toBeTrue();
});
