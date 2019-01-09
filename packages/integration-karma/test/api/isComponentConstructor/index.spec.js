// TODO: disable lwc import check for testing purposes. For now use a workaround to directly access the API from the
// engine inject globally as UMD.
const { LightningElement, isComponentConstructor } = window.Engine;

function testInvalidComponentConstructor(name, ctor) {
    it(`return false for ${name}`, () => {
        // TODO: #933 - isComponentConstructor throws when not passing a proper constructor instead of returning a
        // boolean.
        expect(() => isComponentConstructor(ctor)).toThrowError(
            /Invalid prototype chain for \w+, you must extend LightningElement./
        );
    });
}

// TODO: #932 - fix because currently throwing `Cannot read property 'name' of null`
// testInvalidComponentConstructor('null', null);
// testInvalidComponentConstructor('undefined', undefined);

testInvalidComponentConstructor('string', 'component');
testInvalidComponentConstructor('object', {});
testInvalidComponentConstructor('object', class Foo {});

it('should return true if when passing a class inheriting from LightningElement', () => {
    class Component extends LightningElement {}
    expect(isComponentConstructor(Component)).toBe(true);
});

it('should return true if when passing a class with LightningElement in it\'s prototype chain', () => {
    class Base extends LightningElement {}
    class Component extends Base {}
    expect(isComponentConstructor(Component)).toBe(true);
});
