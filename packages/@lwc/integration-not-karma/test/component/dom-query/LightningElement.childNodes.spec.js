import { createElement } from 'lwc';

import ConstructorChildNodes from 'c/constructorChildNodes';
import Parent from 'c/parent';
import ParentWithTextNode from 'c/parentWithTextNode';

describe('LightningElement.childNodes', () => {
    it('should throw when invoked in the constructor', () => {
        expect(() => {
            createElement('c-constructor-child-nodes', { is: ConstructorChildNodes });
        }).toLogErrorDev(
            /Error: \[LWC error]: this.childNodes should not be called during the construction of the custom element for <c-constructor-child-nodes> because the element is not yet in the DOM or has no children yet\./
        );
    });

    it('returns the right elements', () => {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentResult = elm.childNodes;
        expect(parentResult.length).toBe(0);

        const childResult = elm.shadowRoot.querySelector('c-child').componentChildNodes();
        expect(childResult.length).toBe(2);
        expect(childResult[0].className).toBe('foo slotted1');
        expect(childResult[1].className).toBe('foo slotted2');
    });

    it('returns the right nodes', () => {
        const elm = createElement('c-parent-with-text-node', { is: ParentWithTextNode });
        document.body.appendChild(elm);

        const childResult = elm.shadowRoot.querySelector('c-child').componentChildNodes();

        expect(childResult.length).toBe(1);
        expect(childResult[0].nodeType).toBe(Node.TEXT_NODE);
        expect(childResult[0].textContent).toBe('hello from a text node');
    });
});
