import { LightningElement, isComponentConstructor } from 'lwc';

// function testInvalidComponentConstructor(name, ctor) {
//     it(`return false for ${name}`, () => {
//         // TODO: #933 - isComponentConstructor throws when not passing a proper constructor instead of returning a
//         // boolean.
//         expect(() => isComponentConstructor(ctor)).toThrowError(
//             /Invalid prototype chain for \w+, you must extend LightningElement./
//         );
//     });
// }

// TODO: #932 - fix because currently throwing `Cannot read property 'name' of null`
// testInvalidComponentConstructor('null', null);
// testInvalidComponentConstructor('undefined', undefined);

// TODO: #1064 - getComponentDef and isComponentConstructor doesn't behave the same way when running in production mode
// testInvalidComponentConstructor('String', 'component');
// testInvalidComponentConstructor('Object', {});
// testInvalidComponentConstructor('Class', class Foo {});

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
