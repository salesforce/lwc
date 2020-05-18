import { createElement } from 'lwc';

import RenderCountParent from 'x/renderCountParent';

// WIP: Need to figure out why this test doesn't pass.
xit('should not render if the slotted content changes', () => {
    const elm = createElement('x-render-count-parent', { is: RenderCountParent });
    elm.value = 'initial';
    document.body.appendChild(elm);

    expect(elm.getRenderCount()).toBe(1);
    expect(elm.shadowRoot.querySelector('x-render-count-child').getRenderCount()).toBe(1);
    expect(elm.shadowRoot.querySelector('div').textContent).toBe('initial');

    elm.value = 'updated';

    return Promise.resolve().then(() => {
        expect(elm.getRenderCount()).toBe(2);
        expect(elm.shadowRoot.querySelector('x-render-count-child').getRenderCount()).toBe(1);
        expect(elm.shadowRoot.querySelector('div').textContent).toBe('updated');
    });
});
