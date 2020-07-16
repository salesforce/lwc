import { createElement } from 'lwc';

import Test from 'x/test';
import Computed from 'x/computed';

function generateTestCases(testElement) {
    const itTitle = testElement.textContent;
    const expectedPropertyValue = testElement.hasAttribute('data-expected');
    const expectedAttributeValue = testElement.getAttribute('data-expected');

    it(itTitle, () => {
        expect(testElement.hidden).toBe(expectedPropertyValue);
        expect(testElement.getAttribute('hidden')).toBe(expectedAttributeValue);
    });
}

describe('boolean attribute', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    describe('used in html element', () => {
        const tests = elm.shadowRoot.querySelectorAll('.test-case');

        tests.forEach(generateTestCases);
    });

    describe('used in custom element', () => {
        const tests = elm.shadowRoot.querySelectorAll('.ce-test-case');

        tests.forEach(generateTestCases);
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
