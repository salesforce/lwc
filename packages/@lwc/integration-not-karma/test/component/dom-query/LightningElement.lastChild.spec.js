import { createElement } from 'lwc';

import ConstructorLastChild from 'c/constructorLastChild';
import Parent from 'c/parent';
import ParentWithTextNode from 'c/parentWithTextNode';

describe('LightningElement.lastChild', () => {
    it('should throw when invoked in the constructor', () => {
        expect(() => {
            createElement('c-constructor-child-nodes', { is: ConstructorLastChild });
        }).toLogErrorDev(
            /Error: \[LWC error]: this.lastChild should not be called during the construction of the custom element for <c-constructor-child-nodes> because the element is not yet in the DOM or has no children yet\./
        );
    });

    it('returns the right elements', () => {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentResult = elm.lastChild;
        expect(parentResult).toBe(null);

        const childResult = elm.shadowRoot.querySelector('c-child').componentLastChild();
        expect(childResult).not.toBe(null);
        expect(childResult.className).toBe('foo slotted2');
    });

    it('returns the right nodes', () => {
        const elm = createElement('c-parent-with-text-node', { is: ParentWithTextNode });
        document.body.appendChild(elm);

        const childResult = elm.shadowRoot.querySelector('c-child').componentLastChild();

        expect(childResult).not.toBe(null);
        expect(childResult.nodeType).toBe(Node.TEXT_NODE);
        expect(childResult.textContent).toBe('hello from a text node');
    });
});
