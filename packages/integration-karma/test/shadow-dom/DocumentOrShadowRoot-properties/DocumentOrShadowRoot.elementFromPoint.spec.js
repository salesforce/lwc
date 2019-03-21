import { createElement } from 'test-utils';

import ElementFromPoint from 'x/elementFromPoint';

it('should return the external host element', () => {
    const elm = createElement('x-element-from-point', { is: ElementFromPoint });
    document.body.appendChild(elm);

    expect(document.elementFromPoint(5, 5)).toBe(elm);
});

it('should return the internal div element', () => {
    const elm = createElement('x-element-from-point', { is: ElementFromPoint });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.elementFromPoint(5, 5)).toBe(elm.shadowRoot.querySelector('div'));
});
