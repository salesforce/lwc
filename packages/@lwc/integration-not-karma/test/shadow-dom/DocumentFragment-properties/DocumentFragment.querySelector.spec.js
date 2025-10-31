import { createElement } from 'lwc';

import Test from 'c/test';
import SlottedParent from 'c/slotted';

it('should allow searching for one element from template', () => {
    const elm = createElement('c-foo', { is: Test });
    document.body.appendChild(elm);
    const node = elm.shadowRoot.querySelector('p');
    expect(node.tagName).toBe('P');
});

it('should ignore slotted elements when queried via querySelector', () => {
    const elm = createElement('c-foo', { is: SlottedParent });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('p')).not.toBeNull();

    const xChild = elm.shadowRoot.querySelector('c-child');
    expect(xChild.shadowRoot.querySelector('p')).toBeNull();
});
