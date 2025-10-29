import { createElement } from 'lwc';

import Test from 'c/test';
import Computed from 'c/computed';

function assertPropAndAttribute(testElement) {
    const expectedPropertyValue = testElement.hasAttribute('data-expected');
    const expectedAttributeValue = testElement.getAttribute('data-expected');

    expect(testElement.hidden).toBe(expectedPropertyValue);
    expect(testElement.getAttribute('hidden')).toBe(expectedAttributeValue);
}

describe('boolean attribute', () => {
    it('should set the right property and attribute value', () => {
        const host = createElement('c-test', { is: Test });
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

    it('should be added/removed when used with computed value in html element', async () => {
        const elm = createElement('c-computed', { is: Computed });
        document.body.appendChild(elm);

        await Promise.resolve();
        const elmWithHidden = elm.shadowRoot.querySelector('.hidden-value');
        expect(elmWithHidden.hidden).toBe(false);
        expect(elmWithHidden.getAttribute('hidden')).toBeNull();
        elm.toggleHiddenValue();
        await Promise.resolve();
        const elmWithHidden_1 = elm.shadowRoot.querySelector('.hidden-value');
        expect(elmWithHidden_1.hidden).toBe(true);
        expect(elmWithHidden_1.getAttribute('hidden')).toBe('');
        elm.toggleHiddenValue();
        await Promise.resolve();
        const elmWithHidden_2 = elm.shadowRoot.querySelector('.hidden-value');
        expect(elmWithHidden_2.hidden).toBe(false);
        expect(elmWithHidden_2.getAttribute('hidden')).toBeNull();
    });
});
