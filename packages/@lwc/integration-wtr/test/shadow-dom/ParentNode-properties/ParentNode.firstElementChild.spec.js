import { createElement } from 'lwc';

import Test from 'x/test';
import Text from 'x/text';
import Slotted from 'x/slotted';

describe('ParentNode.firstElementChild', () => {
    it('should return the first element child', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.firstElementChild).toBe(null);
        expect(elm.shadowRoot.firstElementChild).toBe(elm.shadowRoot.querySelector('div'));
    });

    it("should return null if component doesn't have element child", () => {
        const elm = createElement('x-text', { is: Text });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.firstElementChild).toBe(null);
    });

    it('should return the right elements for slotted children', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const container = elm.shadowRoot.querySelector('x-container');
        expect(container.firstElementChild).not.toBe(null);
        expect(container.shadowRoot.querySelector('slot').firstElementChild).toBe(null);
    });
});
