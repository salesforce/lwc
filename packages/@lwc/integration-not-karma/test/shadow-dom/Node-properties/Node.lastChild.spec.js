import { createElement } from 'lwc';

import Test from 'c/test';
import Text from 'c/text';
import Empty from 'c/empty';

describe('Node.lasChild', () => {
    it('should return the last child node', () => {
        const elm = createElement('c-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.lastChild).toBe(null);
        expect(elm.shadowRoot.lastChild).toBe(elm.shadowRoot.querySelector('p'));
    });

    it("should return last child Node even if it's a text", () => {
        const elm = createElement('c-text', { is: Text });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.lastChild.nodeType).toBe(Node.TEXT_NODE);
    });

    it('should return null if the template has no children', () => {
        const elm = createElement('c-empty', { is: Empty });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.lastChild).toBe(null);
    });
});
