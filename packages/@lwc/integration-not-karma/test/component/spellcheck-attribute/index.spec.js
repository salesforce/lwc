import { createElement } from 'lwc';

import Container from 'x/container';
import Dynamic from 'x/dynamic';

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

        expect(getSpellcheckValue(elm, 'div.boolean-true-v')).toBe('');
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

        // We explicitly don't test the prop value for `.ce.boolean-true-v` here,
        // since Firefox disagrees with Chrome/Safari. See comment below.
        expect(getSpellcheckPropertyValue(elm, 'div.empty-v')).toBe(true);
        expect(getSpellcheckPropertyValue(elm, 'div.false-v')).toBe(false);
        expect(getSpellcheckPropertyValue(elm, 'div.false-case-insensitive-v')).toBe(false);
        expect(getSpellcheckPropertyValue(elm, 'div.true-v')).toBe(true);
        expect(getSpellcheckPropertyValue(elm, 'div.null-v')).toBe(true);
        expect(getSpellcheckPropertyValue(elm, 'div.falsy-v')).toBe(true);
        expect(getSpellcheckPropertyValue(elm, 'div.truthy-v')).toBe(true);
    });
});

describe('dynamically updating the spellcheck attribute', () => {
    it('sets the initial value', async () => {
        const elm = createElement('x-dynamic', { is: Dynamic });
        document.body.appendChild(elm);

        await Promise.resolve();
        expect(getSpellcheckValue(elm, '.dynamic')).toBe(null);
    });

    const valuesAndExpectations = [
        ['', ''],
        [null, null],
        [undefined, null],
        [false, 'false'],
        ['false', 'false'],
        ['fAlSe', 'fAlSe'],
        [true, 'true'],
        ['true', 'true'],
        [0, '0'],
        ['0', '0'],
        ['truthy', 'truthy'],
    ];

    for (const [setValue, expectedAttrValue] of valuesAndExpectations) {
        it(`sets the value to ${JSON.stringify(setValue)}`, async () => {
            const elm = createElement('x-dynamic', { is: Dynamic });
            document.body.appendChild(elm);

            elm.theSpellcheck = setValue;

            await Promise.resolve();
            expect(getSpellcheckValue(elm, '.dynamic')).toBe(expectedAttrValue);
            // We explicitly don't test the expected prop value here, because Firefox (as of v126 anyway) disagrees
            // with Chrome/Safari on this reflection, and sometimes returns false when the others return true,
            // so it's kind of pointless to test.
        });
    }
});
