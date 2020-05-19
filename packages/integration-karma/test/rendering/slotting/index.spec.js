import { createElement } from 'lwc';

import RenderCountParent from 'x/renderCountParent';
import FallbackContentReuseParent from 'x/fallbackContentReuseParent';

// TODO [#1617]: Engine currently has trouble with slotting and invocation of the renderedCallback.
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

it('#663 - should not reuse elements from the fallback slot content', () => {
    const elm = createElement('x-fallback-content-reuse-parent', {
        is: FallbackContentReuseParent,
    });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('x-fallback-content-reuse-child').innerHTML).toBe('');
    elm.renderSlotted = true;

    return Promise.resolve().then(() => {
        expect(elm.shadowRoot.querySelector('x-fallback-content-reuse-child').innerHTML).toBe(
            '<div>Default slotted</div><div slot="foo">Named slotted</div>'
        );
    });
});
