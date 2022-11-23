import { createElement } from 'lwc';

import Multiple from 'x/multipleIdrefs';

it('should handle multiple idrefs when set dynamically', () => {
    const elm = createElement('x-idref', { is: Multiple });
    document.body.appendChild(elm);

    const aomori = elm.shadowRoot.querySelector('.aomori');
    const hokkaido = elm.shadowRoot.querySelector('.hokkaido');
    const input = elm.shadowRoot.querySelector('.dynamic');

    if (process.env.NATIVE_SHADOW) {
        expect(aomori.id).toMatch(/^aomori$/);
        expect(hokkaido.id).toMatch(/^hokkaido$/);
    } else {
        expect(aomori.id).toMatch(/^aomori-\w+/);
        expect(hokkaido.id).toMatch(/^hokkaido-\w+/);
    }

    expect(input.getAttribute('aria-labelledby')).toContain(aomori.id);
    expect(input.getAttribute('aria-labelledby')).toContain(hokkaido.id);
});

it('should handle multiple idrefs when set statically', () => {
    const elm = createElement('x-idref', { is: Multiple });
    document.body.appendChild(elm);

    const aomori = elm.shadowRoot.querySelector('.aomori');
    const iwate = elm.shadowRoot.querySelector('.iwate');
    const input = elm.shadowRoot.querySelector('.static');

    if (process.env.NATIVE_SHADOW) {
        expect(aomori.id).toMatch(/^aomori$/);
        expect(iwate.id).toMatch(/^iwate$/);
    } else {
        expect(aomori.id).toMatch(/^aomori-\w+/);
        expect(iwate.id).toMatch(/^iwate-\w+/);
    }

    expect(input.getAttribute('aria-labelledby')).toContain(aomori.id);
    expect(input.getAttribute('aria-labelledby')).toContain(iwate.id);
});
