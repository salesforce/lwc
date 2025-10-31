import { createElement } from 'lwc';

import Test from 'c/test';
import Text from 'c/text';
import Slotted from 'c/slotted';

describe('ParentNode.childElementCount', () => {
    it('should return the number of children elements', () => {
        const elm = createElement('c-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.childElementCount).toBe(0);
        expect(elm.shadowRoot.childElementCount).toBe(2);
    });

    it("should return 0 if component doesn't have element child", () => {
        const elm = createElement('c-text', { is: Text });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.childElementCount).toBe(0);
    });

    it('should return the right number of elements for content children', () => {
        const elm = createElement('c-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const container = elm.shadowRoot.querySelector('c-container');
        expect(container.childElementCount).toBe(1);
        expect(container.shadowRoot.querySelector('slot').childElementCount).toBe(0);
    });
});
