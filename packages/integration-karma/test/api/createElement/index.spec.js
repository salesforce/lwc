import { LightningElement, createElement } from 'lwc';

class Component extends LightningElement {}

function testInvalidOptions(type, option) {
    it(`throws a TypeError if option is a ${type}`, () => {
        expect(() => createElement('x-component', option)).toThrowError(TypeError);
    });
}

testInvalidOptions('undefined', undefined);
testInvalidOptions('null', null);
testInvalidOptions('String', 'x-component');
testInvalidOptions('Class not extending LightningElement', class Component {});
testInvalidOptions('Object without the is property', {});

it('returns an HTMLElement', () => {
    const elm = createElement('x-component', { is: Component });
    expect(elm instanceof HTMLElement).toBe(true);
});

it('should create an element with a synthetic shadow root by default', () => {
    const elm = createElement('x-component', { is: Component });
    expect(elm.shadowRoot.constructor.name).toBe('SyntheticShadowRoot');
});

it('supports component constructors in circular dependency', () => {
    function Circular() {
        return Component;
    }
    Circular.__circular__ = true;

    const elm = createElement('x-component', { is: Circular });
    expect(elm instanceof HTMLElement).toBe(true);
});

if (process.env.NATIVE_SHADOW) {
    it('should create an element with a native shadow root if fallback is false', () => {
        const elm = createElement('x-component', {
            is: Component,
            fallback: false,
        });

        expect(elm.shadowRoot instanceof ShadowRoot);
        expect(elm.shadowRoot.constructor.name).toBe('ShadowRoot');
    });

    it('should create a shadowRoot in open mode when mode in not specified', () => {
        const elm = createElement('x-component', {
            is: Component,
            fallback: false,
        });
        expect(elm.shadowRoot.mode).toBe('open');
    });

    it('should create a shadowRoot in closed mode if the mode is passed as closed', () => {
        // Since the shadowRoot property is not attached to the element in closed mode, we need to retrieve it by
        // accessing the template property from the class constructor.
        let shadowRoot;
        class ClosedShadowComponent extends LightningElement {
            constructor() {
                super();
                shadowRoot = this.template;
            }
        }

        createElement('x-component', {
            is: ClosedShadowComponent,
            fallback: false,
            mode: 'closed',
        });

        expect(shadowRoot instanceof ShadowRoot);
        expect(shadowRoot.mode).toBe('closed');
    });
}

describe('locker integration', () => {
    it('should support component class that extend a mirror of the LightningElement', () => {
        function SecureBaseClass() {
            if (this instanceof SecureBaseClass) {
                LightningElement.prototype.constructor.call(this);
            } else {
                return SecureBaseClass;
            }
        }
        SecureBaseClass.__circular__ = true;

        class Component extends SecureBaseClass {}
        const elm = createElement('x-component', { is: Component });
        expect(elm instanceof HTMLElement).toBe(true);
    });
});
