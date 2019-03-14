import { createElement } from 'test-utils';

import Parent from 'x/parent';

it('should transform id value if it is read from the host and rendered to the shadow', () => {
    const elm = createElement('x-parent', { is: Parent });
    document.body.appendChild(elm);

    const child = elm.shadowRoot.querySelector('x-child');
    const internal = child.shadowRoot.querySelector('div');
    expect(child.id).toBeTruthy();
    expect(internal.id).toBeTruthy();
    expect(child.id).not.toBe(internal.id);
});

it('should transform id value if it is set to a boolean value', () => {
    const elm = createElement('x-parent', { is: Parent });
    elm.customElementId = true;
    elm.nativeElementId = false;
    document.body.appendChild(elm);

    const child = elm.shadowRoot.querySelector('x-child');
    const div = elm.shadowRoot.querySelector('div');
    const renderedCustomElementId = child.id;
    const renderedNativeElementId = div.getAttribute('id');
    const originalCustomElementId = child.className;
    const originalNativeElementId = div.className;
    expect(renderedCustomElementId).toBeTruthy();
    expect(renderedNativeElementId).toBeTruthy();
    expect(renderedCustomElementId).not.toBe(originalCustomElementId);
    expect(renderedNativeElementId).not.toBe(originalNativeElementId);
});

it('should not render id attribute on native elements if it is set to `null`', () => {
    const elm = createElement('x-parent', { is: Parent });
    elm.nativeElementId = null;
    document.body.appendChild(elm);

    const nativeElement = elm.shadowRoot.querySelector('div');
    expect(nativeElement.getAttribute('id')).toBeNull();
});
