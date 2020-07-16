import { createElement } from 'lwc';

import Container from 'x/container';

function getSpellcheckValue(container, selector) {
    const elm = container.shadowRoot.querySelector(selector);

    return elm.getAttribute('spellcheck');
}

function getSpellcheckPropertyValue(container, selector) {
    const elm = container.shadowRoot.querySelector(selector);

    return elm.spellcheck;
}

describe('setting static values on custom elements', () => {
    it('should render the correct attribute value', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        expect(getSpellcheckValue(elm, '.ce.boolean-true-v')).toBe('true');
        expect(getSpellcheckValue(elm, '.ce.empty-v')).toBe('true');
        expect(getSpellcheckValue(elm, '.ce.false-v')).toBe('false');
        expect(getSpellcheckValue(elm, '.ce.false-case-insensitive-v')).toBe('false');
        expect(getSpellcheckValue(elm, '.ce.true-v')).toBe('true');
        expect(getSpellcheckValue(elm, '.ce.null-v')).toBe('true');
        expect(getSpellcheckValue(elm, '.ce.falsy-v')).toBe('true');
        expect(getSpellcheckValue(elm, '.ce.truthy-v')).toBe('true');
    });

    it('should have the correct property value', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        expect(getSpellcheckPropertyValue(elm, '.ce.boolean-true-v')).toBe(true);
        expect(getSpellcheckPropertyValue(elm, '.ce.empty-v')).toBe(true);
        expect(getSpellcheckPropertyValue(elm, '.ce.false-v')).toBe(false);
        expect(getSpellcheckPropertyValue(elm, '.ce.false-case-insensitive-v')).toBe(false);
        expect(getSpellcheckPropertyValue(elm, '.ce.true-v')).toBe(true);
        expect(getSpellcheckPropertyValue(elm, '.ce.null-v')).toBe(true);
        expect(getSpellcheckPropertyValue(elm, '.ce.falsy-v')).toBe(true);
        expect(getSpellcheckPropertyValue(elm, '.ce.truthy-v')).toBe(true);
    });
});

describe('setting static values on non custom elements', () => {
    it('should have the correct property value', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        expect(getSpellcheckValue(elm, 'div.boolean-true-v')).toBe('true');
        expect(getSpellcheckValue(elm, 'div.empty-v')).toBe('true');
        expect(getSpellcheckValue(elm, 'div.false-v')).toBe('false');
        expect(getSpellcheckValue(elm, 'div.false-case-insensitive-v')).toBe('false');
        expect(getSpellcheckValue(elm, 'div.true-v')).toBe('true');
        expect(getSpellcheckValue(elm, 'div.null-v')).toBe('true');
        expect(getSpellcheckValue(elm, 'div.falsy-v')).toBe('true');
        expect(getSpellcheckValue(elm, 'div.truthy-v')).toBe('true');
    });

    it('should render the correct attribute value', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        expect(getSpellcheckPropertyValue(elm, 'div.boolean-true-v')).toBe(true);
        expect(getSpellcheckPropertyValue(elm, 'div.empty-v')).toBe(true);
        expect(getSpellcheckPropertyValue(elm, 'div.false-v')).toBe(false);
        expect(getSpellcheckPropertyValue(elm, 'div.false-case-insensitive-v')).toBe(false);
        expect(getSpellcheckPropertyValue(elm, 'div.true-v')).toBe(true);
        expect(getSpellcheckPropertyValue(elm, 'div.null-v')).toBe(true);
        expect(getSpellcheckPropertyValue(elm, 'div.falsy-v')).toBe(true);
        expect(getSpellcheckPropertyValue(elm, 'div.truthy-v')).toBe(true);
    });
});
