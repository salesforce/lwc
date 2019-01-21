import { createElement } from 'test-utils';

import Slots from 'x/slots';

it('should return the slot name attribute in the DOM', () => {
    const elm = createElement('x-test', { is: Slots });
    document.body.appendChild(elm);

    const slots = elm.shadowRoot.querySelectorAll('slot');
    expect(slots[0].getAttribute('name')).toBe(null);
    expect(slots[1].getAttribute('name')).toBe('foo');
});

it('should have property reflecting the attribute', () => {
    const elm = createElement('x-test', { is: Slots });
    document.body.appendChild(elm);

    const slots = elm.shadowRoot.querySelectorAll('slot');
    expect(slots[0].name).toBe('');
    expect(slots[1].name).toBe('foo');
});
