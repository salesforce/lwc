import { LightningElement } from 'lwc';

import ReflectElement from 'x/reflect';
import LifecycleParent from 'x/lifecycleParent';
import WithChildElms from 'x/withChildElms';

// We can't register standard custom elements if we run compat because of the transformation applied to the component
// constructor.
const SUPPORTS_CUSTOM_ELEMENTS = !process.env.COMPAT && 'customElements' in window;

it('should throw when trying to claim abstract LightningElement as custom element', () => {
    expect(() => LightningElement.CustomElementConstructor).toThrowError(
        TypeError,
        `Invalid Constructor. LightningElement base class can't be claimed as a custom element.`
    );
});

if (SUPPORTS_CUSTOM_ELEMENTS) {
    it('should return a custom element', () => {
        class Test extends LightningElement {}
        const TestCustomElement = Test.CustomElementConstructor;

        expect(typeof TestCustomElement).toBe('function');
    });

    it('should create a custom element with shadow mode set to "open" by default', () => {
        class Test extends LightningElement {}

        const TestCustomElement = Test.CustomElementConstructor;
        customElements.define('test-custom-element-default', TestCustomElement);

        const elm = document.createElement('test-custom-element-default');
        document.body.appendChild(elm);

        expect(elm.shadowRoot).not.toBe(null);
        expect(elm.shadowRoot.mode).toBe('open');
    });

    describe('implicit hydration', () => {
        let consoleSpy;
        beforeEach(() => {
            // eslint-disable-next-line no-undef
            consoleSpy = TestUtils.spyConsole();
        });
        afterEach(() => {
            consoleSpy.reset();
        });

        it('should occur when element exists before customElements.define', () => {
            const elm = document.createElement('test-custom-element-preexisting');
            document.body.appendChild(elm);

            expect(elm.shadowRoot).toBe(null);
            customElements.define(
                'test-custom-element-preexisting',
                WithChildElms.CustomElementConstructor
            );
            expect(elm.shadowRoot).not.toBe(null);

            const observedErrors = consoleSpy.calls.error
                .flat()
                .map((err) => (err instanceof Error ? err.message : err));
            expect(observedErrors).toContain(
                '[LWC error]: Hydration mismatch: incorrect number of rendered nodes. Client produced more nodes than the server.\n'
            );
            expect(observedErrors).toContain('[LWC error]: Hydration completed with errors.\n');
        });
    });

    describe('lifecycle', () => {
        beforeAll(() => {
            const LifecycleParentCustomElement = LifecycleParent.CustomElementConstructor;
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
            const ReflectCustomElement = ReflectElement.CustomElementConstructor;
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

            elm.runInComponentContext((cmp) => {
                cmp.setAttribute('title', 'foo');
                cmp.setAttribute('number', 10);
            });

            expect(elm.title).toBe('foo');
            expect(elm.number).toBe(10);
        });
    });
}
