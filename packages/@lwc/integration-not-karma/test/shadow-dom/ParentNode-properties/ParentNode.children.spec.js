import { createElement } from 'lwc';

import Test from 'c/test';
import Text from 'c/text';
import Slotted from 'c/slotted';

describe('ParentNode.children', () => {
    it('should return all the element children', () => {
        const elm = createElement('c-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.children.length).toBe(0);

        const { children } = elm.shadowRoot;
        expect(children.length).toBe(2);
        expect(children[0]).toBe(elm.shadowRoot.querySelector('div'));
        expect(children[1]).toBe(elm.shadowRoot.querySelector('p'));
    });

    it('should omit nodes that are node elements', () => {
        const elm = createElement('c-text', { is: Text });
        document.body.appendChild(elm);

        const { children } = elm.shadowRoot;
        expect(children.length).toBe(0);
    });

    it('should return the right elements for slotted children', () => {
        const elm = createElement('c-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const container = elm.shadowRoot.querySelector('c-container');
        expect(container.children.length).toBe(1);
        expect(container.shadowRoot.querySelector('slot').children.length).toBe(0);
    });
});
