import { createElement } from 'lwc';

import Multiple from 'x/multipleIdrefs';

it('should handle multiple idrefs', () => {
    const elm = createElement('x-idref', { is: Multiple });
    document.body.appendChild(elm);

    const aomori = elm.shadowRoot.querySelector('.aomori');
    const hokkaido = elm.shadowRoot.querySelector('.hokkaido');
    const input = elm.shadowRoot.querySelector('input');

    expect(aomori.id).toMatch(/^aomori-\w+/);
    expect(hokkaido.id).toMatch(/^hokkaido-\w+/);
    expect(input.ariaLabelledBy).toContain(aomori.id);
    expect(input.ariaLabelledBy).toContain(hokkaido.id);
});
