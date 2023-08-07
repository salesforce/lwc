import { createElement } from 'lwc';
import Parent from 'x/dualTemplate1506';

it('setting tracked value in disconnectedCallback should not throw', () => {
    const elm = createElement('x-parent', { is: Parent });
    document.body.appendChild(elm);
    expect(
        elm.shadowRoot.querySelector('x-disconnected-callback-sets-tracked-value')
    ).not.toBeNull();
    elm.toggleTemplate();

    return Promise.resolve().then(() => {
        expect(elm.shadowRoot.querySelector('div').textContent).toBe('simple template');
    });
});
