import { createElement } from 'lwc';

import Test from 'x/test';
import Text from 'x/text';
import Slotted from 'x/slotted';

describe('ParentNode.lastElementChild', () => {
    it('should return the last element child', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.lastElementChild).toBe(null);
        expect(elm.shadowRoot.lastElementChild).toBe(elm.shadowRoot.querySelector('p'));
    });

    it("should return null if component doesn't have element child", () => {
        const elm = createElement('x-text', { is: Text });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.lastElementChild).toBe(null);
    });

    it('should return the right elements for slotted children', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const container = elm.shadowRoot.querySelector('x-container');
        expect(container.lastElementChild).not.toBe(null);
        expect(container.shadowRoot.querySelector('slot').lastElementChild).toBe(null);
    });
});
