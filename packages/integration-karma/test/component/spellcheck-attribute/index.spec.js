import { createElement } from 'lwc';

import Container from 'x/container';

function getSpellcheckValue(container, selector) {
    const elm = container.shadowRoot.querySelector(selector);

    return elm.getAttribute('spellcheck');
}

describe('spellcheck attribute', () => {
    it('should cast to true static values other than false', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            expect(getSpellcheckValue(elm, '.empty-v')).toBe('true');
            expect(getSpellcheckValue(elm, '.false-v')).toBe('false');
            expect(getSpellcheckValue(elm, '.true-v')).toBe('true');
            expect(getSpellcheckValue(elm, '.null-v')).toBe('true');
            expect(getSpellcheckValue(elm, '.falsy-v')).toBe('true');
            expect(getSpellcheckValue(elm, '.truthy-v')).toBe('true');
        });
    });

    describe('using expression value', () => {
        const testCases = [
            { value: undefined, expectedSpellcheckValue: 'false' },
            { value: null, expectedSpellcheckValue: 'false' },
            { value: '', expectedSpellcheckValue: 'false' },
            { value: 'false', expectedSpellcheckValue: 'true' }, // notice that this is string false.
            { value: false, expectedSpellcheckValue: 'false' },
            { value: 0, expectedSpellcheckValue: 'false' },
            { value: 'truthy', expectedSpellcheckValue: 'true' },
        ];

        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        testCases.forEach(({ value, expectedSpellcheckValue }) => {
            it(`should cast to ${expectedSpellcheckValue} when value is "${value}"`, () => {
                elm.spellcheckValue = value;

                return Promise.resolve().then(() => {
                    expect(getSpellcheckValue(elm, '.computed')).toBe(expectedSpellcheckValue);
                });
            });
        });
    });
});
