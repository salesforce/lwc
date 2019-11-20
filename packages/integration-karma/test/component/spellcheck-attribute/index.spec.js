import { createElement } from 'lwc';

import Container from 'x/container';

function getSpellcheckValue(container, selector) {
    const elm = container.shadowRoot.querySelector(selector);

    return elm.getAttribute('spellcheck');
}

it('should render the correct attribute value for static values', () => {
    const elm = createElement('x-container', { is: Container });
    document.body.appendChild(elm);

    expect(getSpellcheckValue(elm, '.empty-v')).toBe('true');
    expect(getSpellcheckValue(elm, '.false-v')).toBe('false');
    expect(getSpellcheckValue(elm, '.false-case-insensitive-v')).toBe('false');
    expect(getSpellcheckValue(elm, '.true-v')).toBe('true');
    expect(getSpellcheckValue(elm, '.null-v')).toBe('true');
    expect(getSpellcheckValue(elm, '.falsy-v')).toBe('true');
    expect(getSpellcheckValue(elm, '.truthy-v')).toBe('true');
});

describe('when set dynamically using expressions', () => {
    const testCases = [
        { value: undefined, expectedSpellcheckValue: true }, // why in the textarea, is showing false?
        { value: null, expectedSpellcheckValue: true },
        { value: '', expectedSpellcheckValue: true },
        { value: 'false', expectedSpellcheckValue: false },
        { value: false, expectedSpellcheckValue: false },
        { value: 0, expectedSpellcheckValue: true },
        { value: 'truthy', expectedSpellcheckValue: true },
        { value: {}, expectedSpellcheckValue: true },
    ];
    const elm = createElement('x-container', { is: Container });
    document.body.appendChild(elm);

    testCases.forEach(({ value, expectedSpellcheckValue }) => {
        it(`should render ${expectedSpellcheckValue} when the expression value is "${value}"`, () => {
            elm.spellcheckValue = value;

            return Promise.resolve().then(() => {
                expect(getSpellcheckValue(elm, '.computed')).toBe(
                    expectedSpellcheckValue.toString()
                );
            });
        });
    });
});
