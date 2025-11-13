import { createElement } from 'lwc';

import Test from 'x/test';
import SlottedParent from 'x/slotted';

it('should allow searching for one element from template', () => {
    const elm = createElement('x-foo', { is: Test });
    document.body.appendChild(elm);
    const node = elm.shadowRoot.querySelector('p');
    expect(node.tagName).toBe('P');
});

it('should ignore slotted elements when queried via querySelector', () => {
    const elm = createElement('x-foo', { is: SlottedParent });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('p')).not.toBeNull();

    const xChild = elm.shadowRoot.querySelector('x-child');
    expect(xChild.shadowRoot.querySelector('p')).toBeNull();
});
