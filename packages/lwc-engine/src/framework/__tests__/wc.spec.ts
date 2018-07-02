import { Element } from "../main";
import { buildCustomElementConstructor } from "../wc";

describe('wc', () => {

    it('should create a new constructor from LWCElement', () => {
        class MyComponent extends Element {}
        const WC = buildCustomElementConstructor(MyComponent);
        expect(typeof WC).toBe('function');
    });

    it('should define public API in prototype chain', () => {
        class MyComponent extends Element {
            foo() {}
        }
        MyComponent.publicMethods = ['foo'];
        MyComponent.publicProps = { bar: {} };
        const WC = buildCustomElementConstructor(MyComponent);
        expect('foo' in WC.prototype).toBe(true);
        expect('bar' in WC.prototype).toBe(true);
    });

    it('should not support forceTagName', () => {
        class MyComponent extends Element {
            static forceTagName = 'button';
        }
        expect(() => {
            buildCustomElementConstructor(MyComponent)
        }).toThrow();
    });

});
