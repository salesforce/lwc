import { createElement } from 'lwc';

import Test from 'x/test';
import Text from 'x/text';
import Empty from 'x/empty';

describe('Node.lasChild', () => {
    it('should return the last child node', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.lastChild).toBe(null);
        expect(elm.shadowRoot.lastChild).toBe(elm.shadowRoot.querySelector('p'));
    });

    it("should return last child Node even if it's a text", () => {
        const elm = createElement('x-text', { is: Text });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.lastChild.nodeType).toBe(Node.TEXT_NODE);
    });

    it('should return null if the template has no children', () => {
        const elm = createElement('x-empty', { is: Empty });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.lastChild).toBe(null);
    });
});
