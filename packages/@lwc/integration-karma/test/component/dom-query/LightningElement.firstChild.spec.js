import { createElement } from 'lwc';

import ConstructorFirstChild from 'x/constructorFirstChild';
import Parent from 'x/parent';
import ParentWithTextNode from 'x/parentWithTextNode';

describe('LightningElement.firstChild', () => {
    it('should throw when invoked in the constructor', () => {
        expect(() => {
            createElement('x-constructor-child-nodes', { is: ConstructorFirstChild });
        }).toLogErrorDev(
            /Error: \[LWC error]: this.firstChild should not be called during the construction of the custom element for <x-constructor-child-nodes> because the element is not yet in the DOM or has no children yet\./
        );
    });

    it('returns the right elements', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentResult = elm.firstChild;
        expect(parentResult).toBe(null);

        const childResult = elm.shadowRoot.querySelector('x-child').componentFirstChild();
        expect(childResult).not.toBe(null);
        expect(childResult.className).toBe('foo slotted1');
    });

    it('returns the right nodes', () => {
        const elm = createElement('x-parent-with-text-node', { is: ParentWithTextNode });
        document.body.appendChild(elm);

        const childResult = elm.shadowRoot.querySelector('x-child').componentFirstChild();

        expect(childResult).not.toBe(null);
        expect(childResult.nodeType).toBe(Node.TEXT_NODE);
        expect(childResult.textContent).toBe('hello from a text node');
    });
});
