import { LightningElement } from 'lwc';

import ReflectElement from 'x/reflect';
import LifecycleParent from 'x/lifecycleParent';
import WithChildElms from 'x/withChildElms';
import DefinedComponent from 'x/definedComponent';
import UndefinedComponent from 'x/undefinedComponent';
import AttrChanged from 'x/attrChanged';
import ReflectCamel from 'x/reflectCamel';

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
    it('CustomElementConstructor should be a function', () => {
        class Test extends LightningElement {}

        const TestCustomElement = Test.CustomElementConstructor;

        expect(typeof TestCustomElement).toBe('function');
    });

    it('CustomElementConstructor cannot be `new`ed before being defined', () => {
        const func = () => {
            new UndefinedComponent.CustomElementConstructor();
        };
        expect(func).toThrowError(TypeError);
        expect(func).toThrowError(/(Illegal constructor|does not define a custom element)/);
    });

    it('CustomElementConstructor can be `new`ed after being defined', () => {
        customElements.define('x-my-defined-component', DefinedComponent.CustomElementConstructor);
        const elm = new DefinedComponent.CustomElementConstructor();
        expect(elm.tagName.toLowerCase()).toEqual('x-my-defined-component');
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

    it('should create custom element if it exists before customElements.define', () => {
        const elm = document.createElement('test-custom-element-preexisting');
        document.body.appendChild(elm);

        customElements.define(
            'test-custom-element-preexisting',
            WithChildElms.CustomElementConstructor
        );
        expect(elm.shadowRoot).not.toBe(null);
    });
    describe('non-empty custom element', () => {
        let consoleSpy;
        beforeEach(() => {
            // eslint-disable-next-line no-undef
            consoleSpy = TestUtils.spyConsole();
        });
        afterEach(() => {
            consoleSpy.reset();
        });
        it('should log error if custom element has children', () => {
            const elm = document.createElement('test-custom-element-preexisting2');
            elm.innerHTML = '<div>child1</div><div>child2</div>';
            document.body.appendChild(elm);
            customElements.define(
                'test-custom-element-preexisting2',
                // "creating" a new component, so we can register under a different tag
                class extends WithChildElms.CustomElementConstructor {}
            );
            const observedErrors = consoleSpy.calls.warn
                .flat()
                .map((err) => (err instanceof Error ? err.message : err));

            if (process.env.NODE_ENV === 'production') {
                expect(observedErrors).toEqual([]);
            } else {
                expect(observedErrors).toEqual([
                    'Custom elements cannot have child nodes. Ensure the element is empty, including whitespace.',
                ]);
            }
            expect(elm.shadowRoot.innerHTML).toBe('<div></div>');
        });
        it('should log error if custom element has shadow root', () => {
            const elm = document.createElement('test-custom-element-preexisting3');
            elm.attachShadow({ mode: 'open' });
            elm.shadowRoot.innerHTML = '<div>child1</div><div>child2</div>';
            document.body.appendChild(elm);
            customElements.define(
                'test-custom-element-preexisting3',
                // "creating" a new component, so we can register under a different tag
                class extends WithChildElms.CustomElementConstructor {}
            );
            const observedErrors = consoleSpy.calls.warn
                .flat()
                .map((err) => (err instanceof Error ? err.message : err));

            if (process.env.NODE_ENV === 'production') {
                expect(observedErrors).toEqual([]);
            } else {
                expect(observedErrors).toEqual([
                    'Found an existing shadow root for the custom element "Child". Call `hydrateComponent` instead.',
                ]);
            }
            expect(elm.shadowRoot.innerHTML).toBe('<div></div>');
        });
        it('should be handled if created after registration', () => {
            customElements.define(
                'test-custom-element-preexisting4',
                // "creating" a new component, so we can register under a different tag
                class extends WithChildElms.CustomElementConstructor {}
            );
            const elm = document.createElement('div');
            elm.innerHTML =
                '<test-custom-element-preexisting4>Slotted</test-custom-element-preexisting4>';
            document.body.appendChild(elm);
            const observedErrors = consoleSpy.calls.warn
                .flat()
                .map((err) => (err instanceof Error ? err.message : err));

            if (process.env.NODE_ENV === 'production') {
                expect(observedErrors).toEqual([]);
            } else {
                expect(observedErrors).toEqual([
                    'Custom elements cannot have child nodes. Ensure the element is empty, including whitespace.',
                ]);
            }
            expect(elm.children[0].shadowRoot.innerHTML).toBe('<div></div>');
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
            customElements.define('test-reflect', ReflectElement.CustomElementConstructor);
            customElements.define('test-reflect-camel', ReflectCamel.CustomElementConstructor);
            customElements.define('test-attr-changed', AttrChanged.CustomElementConstructor);
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

        it('reflects kebab-case attributes to camel-case props', () => {
            const elm = document.createElement('test-reflect-camel');
            document.body.appendChild(elm);

            elm.setAttribute('my-prop', 'foo');

            expect(elm.getAttribute('my-prop')).toBe('foo');
            expect(elm.myProp).toBe('foo');
        });

        // TODO [#2972]: support attributeChangedCallback
        it('never calls attributeChangedCallback', async () => {
            const elm = document.createElement('test-attr-changed');
            document.body.appendChild(elm);

            elm.setAttribute('observed', 'foo');
            elm.setAttribute('api', 'foo');
            elm.setAttribute('track', 'foo');

            await Promise.resolve(); // just in case attributeChangedCallback is called async

            // attributeChangedCallback is not called for any of these
            expect(elm.attributeChangedCallbackCalls).toEqual([]);
        });

        it('only reflects @api, not @track or observedAttributes', () => {
            const elm = document.createElement('test-attr-changed');
            document.body.appendChild(elm);

            elm.setAttribute('observed', 'foo');
            elm.setAttribute('api', 'foo');
            elm.setAttribute('track', 'foo');

            // attrs are all set
            expect(elm.getAttribute('observed')).toBe('foo');
            expect(elm.getAttribute('api')).toBe('foo');
            expect(elm.getAttribute('track')).toBe('foo');

            // for props, only @api props are set
            expect(elm.observed).toBeUndefined();
            expect(elm.api).toBe('foo');
            expect(elm.track).toBeUndefined();
        });

        it('does not call setter more than once if unchanged', () => {
            const elm = document.createElement('test-attr-changed');
            document.body.appendChild(elm);

            expect(elm.apiSetterCallCounts).toEqual(0);

            elm.setAttribute('api', 'foo');
            expect(elm.api).toBe('foo');
            expect(elm.apiSetterCallCounts).toEqual(1);

            elm.setAttribute('api', 'foo');
            expect(elm.api).toBe('foo');
            expect(elm.apiSetterCallCounts).toEqual(1);

            elm.setAttribute('api', 'bar');
            expect(elm.api).toBe('bar');
            expect(elm.apiSetterCallCounts).toEqual(2);
        });
    });
}
