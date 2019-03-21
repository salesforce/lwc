import { createElement } from 'test-utils';

import ElementFromPoint from 'x/elementFromPoint';

let elm;

beforeAll(() => {
    elm = createElement('x-element-from-point', { is: ElementFromPoint });
    document.body.appendChild(elm);
});

it('should return the external host element', () => {
    expect(document.elementFromPoint(5, 5)).toBe(elm);
});

it('should return the internal div element', () => {
    expect(elm.shadowRoot.elementFromPoint(5, 5)).toBe(elm.shadowRoot.querySelector('div'));
});
