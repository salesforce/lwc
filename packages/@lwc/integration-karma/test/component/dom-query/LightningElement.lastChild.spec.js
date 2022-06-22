import { createElement } from 'lwc';

import ConstructorLastChild from 'x/constructorLastChild';
import Parent from 'x/parent';
import ParentWithTextNode from 'x/parentWithTextNode';

describe('LightningElement.lastChild', () => {
    it('should throw when invoked in the constructor', () => {
        expect(() => {
            createElement('x-constructor-child-nodes', { is: ConstructorLastChild });
        }).toLogErrorDev(
            /Error: \[LWC error]: this.lastChild should not be called during the construction of the custom element for <x-constructor-child-nodes> because the element is not yet in the DOM or has no children yet\./
        );
    });

    it('returns the right elements', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentResult = elm.lastChild;
        expect(parentResult).toBe(null);

        const childResult = elm.shadowRoot.querySelector('x-child').componentLastChild();
        expect(childResult).not.toBe(null);
        expect(childResult.className).toBe('foo slotted2');
    });

    it('returns the right nodes', () => {
        const elm = createElement('x-parent-with-text-node', { is: ParentWithTextNode });
        document.body.appendChild(elm);

        const childResult = elm.shadowRoot.querySelector('x-child').componentLastChild();

        expect(childResult).not.toBe(null);
        expect(childResult.nodeType).toBe(Node.TEXT_NODE);
        expect(childResult.textContent).toBe('hello from a text node');
    });
});
