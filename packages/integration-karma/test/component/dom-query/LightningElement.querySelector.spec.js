import { createElement } from 'test-utils';
import { LightningElement } from 'lwc';

import Parent from 'x/parent';

describe('LightningElement.querySelector', () => {
    it('should throw when invoked in the constructor', () => {
        class Test extends LightningElement {
            constructor() {
                super();
                this.querySelector('div');
            }
        }

        expect(() => {
            createElement('x-test', { is: Test });
        }).toThrowError(
            Error,
            /Assert Violation: this.querySelector\(\) cannot be called during the construction of the custom element for <x-test> because no children has been added to this element yet\./
        );
    });

    it('returns the right elements', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentResult = elm.componentQuerySelector('div');
        expect(parentResult).toBe(null);

        const childResult = elm.shadowRoot.querySelector('x-child').componentQuerySelector('div');
        expect(childResult).not.toBe(null);
        expect(childResult.className).toBe('foo slotted1');
    });
});

