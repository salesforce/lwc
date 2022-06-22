import { createElement } from 'lwc';

import Test from 'x/test';
import Computed from 'x/computed';

function assertPropAndAttribute(testElement) {
    const expectedPropertyValue = testElement.hasAttribute('data-expected');
    const expectedAttributeValue = testElement.getAttribute('data-expected');

    expect(testElement.hidden).toBe(expectedPropertyValue);
    expect(testElement.getAttribute('hidden')).toBe(expectedAttributeValue);
}

describe('boolean attribute', () => {
    it('should set the right property and attribute value', () => {
        const host = createElement('x-test', { is: Test });
        document.body.appendChild(host);

        const elms = host.shadowRoot.querySelectorAll('.test-case');
        for (const elm of elms) {
            assertPropAndAttribute(elm);
        }

        const customElms = host.shadowRoot.querySelectorAll('.ce-test-case');
        for (const customElm of customElms) {
            assertPropAndAttribute(customElm);
        }
    });

    it('should be added/removed when used with computed value in html element', () => {
        const elm = createElement('x-computed', { is: Computed });
        document.body.appendChild(elm);

        return Promise.resolve()
            .then(() => {
                const elmWithHidden = elm.shadowRoot.querySelector('.hidden-value');
                expect(elmWithHidden.hidden).toBe(false);
                expect(elmWithHidden.getAttribute('hidden')).toBeNull();
                elm.toggleHiddenValue();
            })
            .then(() => {
                const elmWithHidden = elm.shadowRoot.querySelector('.hidden-value');
                expect(elmWithHidden.hidden).toBe(true);
                expect(elmWithHidden.getAttribute('hidden')).toBe('');
                elm.toggleHiddenValue();
            })
            .then(() => {
                const elmWithHidden = elm.shadowRoot.querySelector('.hidden-value');
                expect(elmWithHidden.hidden).toBe(false);
                expect(elmWithHidden.getAttribute('hidden')).toBeNull();
            });
    });
});
