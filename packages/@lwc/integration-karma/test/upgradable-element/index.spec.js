import { createElement } from 'lwc';

import InteropParent from 'x/interopParent';
import Interop from 'x/interop';
import Interop2 from 'x/interop2';
import Child from 'x/child';
import DuplicateChild from 'x/dupChild';

// Regression test for issue W-8059125
it('element in template does not reset element created by createElement api', () => {
    // First time the x-interop tag will be registered
    const interop = createElement('x-interop', { is: Interop });
    document.body.appendChild(interop);

    expect(interop.shadowRoot.querySelector('.content')).not.toBeNull();

    // Second time the x-interop tag will be processed in the parent's template
    const interopParent = createElement('x-interop-parent', { is: InteropParent });
    document.body.appendChild(interopParent);

    // The issue in W-8059125 was that the element created using createElement() was being reset
    const div = interop.shadowRoot.querySelector('.content');
    expect(div).not.toBeNull();
    expect(div.textContent).toEqual('Shadow tree of interop element');
});

it('element created by createElement api does not reset element created in template', () => {
    // First time x-interop is created in x-interop-parent's template
    const interopParent = createElement('x-interop-parent', { is: InteropParent });
    document.body.appendChild(interopParent);

    // Second time x-interop is created using createElement() api
    const interop = createElement('x-interop', { is: Interop });
    document.body.appendChild(interop);

    const div = interopParent.shadowRoot
        .querySelector('x-interop')
        .shadowRoot.querySelector('.content');
    expect(div).not.toBeNull();
    expect(div.textContent).toEqual('Shadow tree of interop element');
});

it('should create elements with correct component behavior even when they share same tag name', () => {
    const childElm = createElement('x-child', { is: Child });
    document.body.appendChild(childElm);
    expect(childElm.tagName.toLowerCase()).toBe('x-child');
    expect(childElm.shadowRoot.querySelector('div').textContent).toBe('Child Component');

    // Create another element with same tag name but different component
    const anotherChildElm = createElement('x-child', { is: DuplicateChild });
    document.body.appendChild(anotherChildElm);
    expect(anotherChildElm.tagName.toLowerCase()).toBe('x-child');
    expect(anotherChildElm.shadowRoot.querySelector('div').textContent).toBe(
        'Duplicate Child Component'
    );
});

// In compat mode, the custom registry is bypassed and an equivalent implementation is used,
// the native registry restrictions are not applicable
const SUPPORTS_CUSTOM_ELEMENTS = !process.env.COMPAT && 'customElements' in window;
if (SUPPORTS_CUSTOM_ELEMENTS && window.lwcRuntimeFlags.ENABLE_SCOPED_CUSTOM_ELEMENT_REGISTRY) {
    describe('duplicate registration', () => {
        function testDuplicateNativeRegistration(testCase, tag, wcClazz) {
            it(`should not throw when registering a duplicate tag in custom element registry with ${testCase}`, () => {
                // First time the x-interop tag will be registered
                const interop = createElement(tag, { is: Interop });
                document.body.appendChild(interop);
                customElements.define(tag, wcClazz);
                const native = document.createElement(tag);
                document.body.appendChild(native);
                expect(interop.tagName.toLowerCase()).toEqual(tag);
                expect(native.tagName.toLowerCase()).toEqual(tag);
            });
        }
        testDuplicateNativeRegistration(
            'anonymous class',
            'x-interop-wc',
            class extends HTMLElement {}
        );
        testDuplicateNativeRegistration(
            'CustomElementConstructor getter',
            'x-interop-lwc-constructor',
            Interop.CustomElementConstructor
        );

        function testDuplicateLwcRegistration(testCase, tag, WebComponentConstructor) {
            it(`should register duplicate tag via lwc.createElement to override element registered with ${testCase}`, () => {
                customElements.define(tag, WebComponentConstructor);
                const customElement = document.createElement(tag);
                document.body.appendChild(customElement);
                const lwcElement = createElement(tag, { is: Interop });
                document.body.appendChild(lwcElement);
                // Both elements will be created with the same tag
                expect(customElement.tagName.toLowerCase()).toEqual(tag);
                expect(lwcElement.tagName.toLowerCase()).toEqual(tag);
            });
        }
        testDuplicateLwcRegistration(
            'anonymous class',
            'x-interop-native-wc',
            class extends HTMLElement {}
        );
        testDuplicateLwcRegistration(
            'CustomElementConstructor getter',
            'x-interop-lwc-wcclass',
            // must use a different constructor or else this will fail because of the other test
            Interop2.CustomElementConstructor
        );
    });
}
