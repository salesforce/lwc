import { LightningElement, getComponentDef } from 'lwc';

import ReflectElement from 'x/reflect';
import LifecycleParent from 'x/lifecycleParent';

// We can't register standard custom elements if we run compat because of the transformation applied to the component
// constructor.
const SUPPORTS_CUSTOM_ELEMENTS = !process.env.COMPAT && 'customElements' in window;

function testInvalidOptions(type, obj) {
    it(`throws a ReferenceError if constructor is a ${type}`, () => {
        expect(() => getComponentDef(obj)).toThrowError(
            TypeError,
            /.+ is not a valid component, or does not extends LightningElement from "lwc". You probably forgot to add the extend clause on the class declaration\./
        );
    });
}

testInvalidOptions('undefined', undefined);
testInvalidOptions('null', null);
testInvalidOptions('String', 'x-component');
testInvalidOptions('Function', function() {});
testInvalidOptions('Class not extending LightningElement', class Component {});
testInvalidOptions('Object without the is property', {});

it('should return a custom element', () => {
    class Test extends LightningElement {}
    const TestCustomElement = Test.CustomElement;

    expect(typeof TestCustomElement).toBe('function');
});

if (SUPPORTS_CUSTOM_ELEMENTS) {
    it('should create a custom element with shadow mode set to "open" by default', () => {
        class Test extends LightningElement {}

        const TestCustomElement = Test.CustomElement;
        customElements.define('test-custom-element-default', TestCustomElement);

        const elm = document.createElement('test-custom-element-default');
        document.body.appendChild(elm);

        expect(elm.shadowRoot).not.toBe(null);
        expect(elm.shadowRoot.mode).toBe('open');
    });

    describe('lifecycle', () => {
        beforeAll(() => {
            const LifecycleParentCustomElement = LifecycleParent.CustomElement;
            customElements.define('test-lifecycle-parent', LifecycleParentCustomElement);
        });

        beforeEach(() => {
            window.timingBuffer = [];
        });
        afterEach(() => {
            delete window.timingBuffer;
        });

        it('should call the lifecycle in the right order', () => {
            const elm = document.createElement('test-lifecycle-parent');
            document.body.appendChild(elm);

            expect(window.timingBuffer).toEqual([
                'parent:constructor',
                'parent:connectedCallback',
                'child:constructor',
                'child:connectedCallback',
                'child:renderedCallback',
                'child:constructor',
                'child:connectedCallback',
                'child:renderedCallback',
                'parent:renderedCallback',
            ]);
        });
    });

    describe('attribute reflection', () => {
        beforeAll(() => {
            const ReflectCustomElement = ReflectElement.CustomElement;
            customElements.define('test-reflect', ReflectCustomElement);
        });

        it('should reflect attribute to properties before the first render', () => {
            const elm = document.createElement('test-reflect');
            elm.setAttribute('title', 'foo');
            elm.setAttribute('number', 10);
            document.body.appendChild(elm);

            expect(elm.title).toBe('foo');
            expect(elm.number).toBe(10);
        });

        it('should reflect attributes to properties', () => {
            const elm = document.createElement('test-reflect');
            document.body.appendChild(elm);

            elm.setAttribute('title', 'foo');
            elm.setAttribute('number', 10);

            expect(elm.title).toBe('foo');
            expect(elm.number).toBe(10);
        });

        it('should not reflect the properties to attributes when set from inside', () => {
            const elm = document.createElement('test-reflect');
            elm.setAttribute('title', 'foo');
            elm.setAttribute('number', 10);
            document.body.appendChild(elm);

            elm.runInComponentContext(cmp => {
                cmp.setAttribute('title', 'foo');
                cmp.setAttribute('number', 10);
            });

            expect(elm.title).toBe('foo');
            expect(elm.number).toBe(10);
        });
    });
}
