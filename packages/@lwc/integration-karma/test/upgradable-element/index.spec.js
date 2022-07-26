import { createElement } from 'lwc';

import InteropParent from 'x/interopParent';
import Interop from 'x/interop';
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
const SUPPORTS_CUSTOM_ELEMENTS = 'customElements' in window;
if (SUPPORTS_CUSTOM_ELEMENTS) {
    describe('duplicate registration', () => {
        function testDuplicateNativeRegistration(testCase, tag, wcClazz) {
            it(`should throw when registering a duplicate tag in custom element registry with ${testCase}`, () => {
                // First time the x-interop tag will be registered
                const interop = createElement(tag, { is: Interop });
                document.body.appendChild(interop);
                expect(() => {
                    customElements.define(tag, wcClazz);
                }).toThrowError(
                    /'x-([a-z]|-)*' has already been defined as a custom element|the name "x-([a-z]|-)*" has already been used with this registry|Cannot define multiple custom elements with the same tag name/
                );
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

        function testDuplicateLwcRegistration(testCase, tag, wcClazz) {
            it(`should log error when registering duplicate tag via lwc.createElement to override element registered with ${testCase}`, () => {
                customElements.define(tag, wcClazz);
                expect(() => {
                    const element = createElement(tag, { is: Interop });
                    // The element will still be created
                    expect(element.tagName.toLowerCase()).toBe(tag);
                }).toLogErrorDev(
                    `Unexpected tag name "${tag}". This name is a registered custom element, preventing LWC to upgrade the element.`
                );
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
            Interop.CustomElementConstructor
        );
    });
}
