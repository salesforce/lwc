import { createElement } from 'test-utils';

import ElementFromPoint from 'x/elementFromPoint';

it('should return the external host element', () => {
    const elm = createElement('x-element-from-point', { is: ElementFromPoint });
    document.body.appendChild(elm);

    const { left, right, top, bottom } = elm.getBoundingClientRect();
    const x = (left + right) / 2;
    const y = (top + bottom) / 2;

    expect(document.elementFromPoint(x, y)).toBe(elm);
});

it('should return the internal div element', () => {
    const elm = createElement('x-element-from-point', { is: ElementFromPoint });
    document.body.appendChild(elm);

    const { left, right, top, bottom } = elm.getBoundingClientRect();
    const x = (left + right) / 2;
    const y = (top + bottom) / 2;

    expect(elm.shadowRoot.elementFromPoint(x, y)).toBe(elm.shadowRoot.querySelector('div'));
});
