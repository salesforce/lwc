import { createElement } from 'lwc';
import Parent from 'c/dualTemplate1506';

it('setting tracked value in disconnectedCallback should not throw', async () => {
    const elm = createElement('c-parent', { is: Parent });
    document.body.appendChild(elm);
    expect(
        elm.shadowRoot.querySelector('c-disconnected-callback-sets-tracked-value')
    ).not.toBeNull();
    elm.toggleTemplate();

    await Promise.resolve();
    expect(elm.shadowRoot.querySelector('div').textContent).toBe('simple template');
});
