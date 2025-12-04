import { LightningElement, isComponentConstructor } from 'lwc';

function testInvalidComponentConstructor(name, ctor) {
    it(`return false for ${name}`, () => {
        expect(isComponentConstructor(ctor)).toBe(false);
    });
}

testInvalidComponentConstructor('null', null);
testInvalidComponentConstructor('undefined', undefined);
testInvalidComponentConstructor('String', 'component');
testInvalidComponentConstructor('Object', {});
testInvalidComponentConstructor('Function', function () {});
testInvalidComponentConstructor('Class', class Foo {});

it('should return true if when passing a class inheriting from LightningElement', () => {
    class Component extends LightningElement {}
    expect(isComponentConstructor(Component)).toBe(true);
});

it("should return true if when passing a class with LightningElement in it's prototype chain", () => {
    class Base extends LightningElement {}
    class Component extends Base {}
    expect(isComponentConstructor(Component)).toBe(true);
});

describe('locker integration', () => {
    it('should return true when passing component class that extend a mirror of the LightningElement', () => {
        function SecureBaseClass() {
            return SecureBaseClass;
        }
        SecureBaseClass.__circular__ = true;

        class Component extends SecureBaseClass {}
        expect(isComponentConstructor(Component)).toBe(true);
    });
});
