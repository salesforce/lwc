import { createElement } from 'test-utils';
import { LightningElement } from 'lwc';

import Parent from 'x/parent';

describe('LightningElement.getElementsByTagName', () => {
    it('should throw when invoked in the constructor', () => {
        class Test extends LightningElement {
            constructor() {
                super();
                this.getElementsByTagName('div');
            }
        }

        expect(() => {
            createElement('x-test', { is: Test });
        }).toThrowError(
            Error,
            /Assert Violation: this.getElementsByTagName\(\) cannot be called during the construction of the custom element for <x-test> because no children has been added to this element yet\./
        );
    });

    // TODO - Open an issue for this
    xit('returns the right elements', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentResult = elm.getElementsByTagName('div');
        expect(parentResult.length).toBe(0);

        const childResult = elm.shadowRoot.querySelector('x-child').getElementsByTagName('div');
        expect(childResult.length).toBe(2);
        expect(childResult[0].className).toBe('foo slotted1');
        expect(childResult[1].className).toBe('foo slotted2');
    });
});

