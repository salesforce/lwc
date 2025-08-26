import { createElement } from 'lwc';

import RadioButton from 'misc/radioButton';
import InputValue from 'live/inputValue';
import InputChecked from 'live/inputChecked';
import SpecialCharacterPublicProp from 'attrs/specialCharacter';
import UppercaseCharacterPublicPropParent from 'attrs/uppercaseParent';

describe('live properties', () => {
    describe('input [checked] property', () => {
        it('should set the right initial value', () => {
            const elm = createElement('live-input-checked', { is: InputChecked });
            elm.checkedValue = true;
            document.body.appendChild(elm);

            expect(elm.shadowRoot.querySelector('input').checked).toBe(true);
        });

        it('should use the DOM value for diffing', () => {
            const elm = createElement('live-input-checked', { is: InputChecked });
            elm.checkedValue = true;
            document.body.appendChild(elm);

            // Simulate user clicking on the checkbox and force to re-render by setting the same value.
            elm.shadowRoot.querySelector('input').checked = false;
            elm.checkedValue = true;

            return Promise.resolve().then(() => {
                expect(elm.shadowRoot.querySelector('input').checked).toBe(true);
            });
        });
    });

    describe('input [value] property', () => {
        it('should set the right initial value', () => {
            const elm = createElement('live-input-value', { is: InputValue });
            elm.valueValue = 'foo bar';
            document.body.appendChild(elm);

            expect(elm.shadowRoot.querySelector('input').value).toBe('foo bar');
        });

        it('should use the DOM value for diffing', () => {
            const elm = createElement('live-input-value', { is: InputValue });
            elm.checkedValue = 'foo bar';
            document.body.appendChild(elm);

            // Simulate user clicking on the checkbox and force to re-render by setting the same value.
            elm.shadowRoot.querySelector('input').value = 'bar baz';
            elm.valueValue = 'foo bar';

            return Promise.resolve().then(() => {
                expect(elm.shadowRoot.querySelector('input').value).toBe('foo bar');
            });
        });
    });
});

describe('custom properties', () => {
    it('should allow attribute value with underscore', () => {
        const elm = createElement('attrs-special-character', { is: SpecialCharacterPublicProp });
        document.body.appendChild(elm);

        expect(elm.public_prop).toBe('underscore property');

        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('attrs-underscore-child').under_score).toEqual(
                'underscore property'
            );
        });
    });

    it('should allow attribute name with a leading uppercase character', () => {
        const elm = createElement('attrs-uppercase-parent', {
            is: UppercaseCharacterPublicPropParent,
        });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('attrs-uppercase-child').Upper).toEqual(
                'uppercase value from parent component'
            );
        });
    });
});

describe('regression', () => {
    it('#793 - should apply the input value on radio button', () => {
        const elm = createElement('misc-radio-button', { is: RadioButton });
        document.body.appendChild(elm);

        const inputs = elm.shadowRoot.querySelectorAll('input');
        expect(inputs[0].value).toBe('a');
        expect(inputs[1].value).toBe('b');
    });
});
