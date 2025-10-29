import { createElement } from 'lwc';

import ConstructorFirstChild from 'c/constructorFirstChild';
import Parent from 'c/parent';
import ParentWithTextNode from 'c/parentWithTextNode';

describe('LightningElement.firstChild', () => {
    it('should throw when invoked in the constructor', () => {
        expect(() => {
            createElement('c-constructor-child-nodes', { is: ConstructorFirstChild });
        }).toLogErrorDev(
            /Error: \[LWC error]: this.firstChild should not be called during the construction of the custom element for <c-constructor-child-nodes> because the element is not yet in the DOM or has no children yet\./
        );
    });

    it('returns the right elements', () => {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentResult = elm.firstChild;
        expect(parentResult).toBe(null);

        const childResult = elm.shadowRoot.querySelector('c-child').componentFirstChild();
        expect(childResult).not.toBe(null);
        expect(childResult.className).toBe('foo slotted1');
    });

    it('returns the right nodes', () => {
        const elm = createElement('c-parent-with-text-node', { is: ParentWithTextNode });
        document.body.appendChild(elm);

        const childResult = elm.shadowRoot.querySelector('c-child').componentFirstChild();

        expect(childResult).not.toBe(null);
        expect(childResult.nodeType).toBe(Node.TEXT_NODE);
        expect(childResult.textContent).toBe('hello from a text node');
    });
});
