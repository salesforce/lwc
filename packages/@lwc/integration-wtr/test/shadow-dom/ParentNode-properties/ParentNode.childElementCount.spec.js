import { createElement } from 'lwc';

import Test from 'x/test';
import Text from 'x/text';
import Slotted from 'x/slotted';

describe('ParentNode.childElementCount', () => {
    it('should return the number of children elements', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.childElementCount).toBe(0);
        expect(elm.shadowRoot.childElementCount).toBe(2);
    });

    it("should return 0 if component doesn't have element child", () => {
        const elm = createElement('x-text', { is: Text });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.childElementCount).toBe(0);
    });

    it('should return the right number of elements for content children', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const container = elm.shadowRoot.querySelector('x-container');
        expect(container.childElementCount).toBe(1);
        expect(container.shadowRoot.querySelector('slot').childElementCount).toBe(0);
    });
});
