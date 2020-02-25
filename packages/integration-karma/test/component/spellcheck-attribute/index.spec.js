import { createElement } from 'lwc';

import Container from 'x/container';

function getSpellcheckValue(container, selector) {
    const elm = container.shadowRoot.querySelector(selector);

    return elm.getAttribute('spellcheck');
}

describe('setting static values on custom elements', () => {
    it('should render the correct attribute value', () => {
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
});
