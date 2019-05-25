import { createElement } from 'lwc';

import Test from 'x/test';
import SlottedParent from 'x/slotted';

it('should allow searching for elements from template', () => {
    const elm = createElement('x-foo', { is: Test });
    document.body.appendChild(elm);

    const nodes = elm.shadowRoot.querySelectorAll('p');
    expect(nodes.length).toBe(1);
});

it('should ignore slotted elements when queried via querySelectorAll', () => {
    const elm = createElement('x-foo', { is: SlottedParent });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelectorAll('p').length).toBe(1);

    const xChild = elm.shadowRoot.querySelector('x-child');
    expect(xChild.shadowRoot.querySelectorAll('p').length).toBe(0);
});
