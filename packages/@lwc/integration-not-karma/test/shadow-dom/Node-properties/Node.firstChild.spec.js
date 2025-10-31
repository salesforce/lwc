import { createElement } from 'lwc';

import Test from 'c/test';
import Text from 'c/text';
import Empty from 'c/empty';

describe('Node.firstChild', () => {
    it('should return the first child node', () => {
        const elm = createElement('c-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.firstChild).toBe(null);
        expect(elm.shadowRoot.firstChild).toBe(elm.shadowRoot.querySelector('div'));
    });

    it("should return first child Node even if it's a text", () => {
        const elm = createElement('c-text', { is: Text });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.firstChild.nodeType).toBe(Node.TEXT_NODE);
    });

    it('should return null if the template has no children', () => {
        const elm = createElement('c-empty', { is: Empty });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.firstChild).toBe(null);
    });
});
