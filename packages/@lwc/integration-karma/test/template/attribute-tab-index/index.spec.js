import { createElement } from 'lwc';

import Test from 'x/test';

function validAttribute(value, expectedValue) {
    it(`should render the tabindex attribute in the DOM when set to ${value}`, () => {
        const elm = createElement('x-test', { is: Test });
        elm.tabIndexValue = value;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('div').getAttribute('tabindex')).toBe(expectedValue);
    });
}

function invalidAttribute(value) {
    it(`should log an error when tabindex attribute is set to ${value}`, () => {
        const elm = createElement('x-test', { is: Test });
        elm.tabIndexValue = value;

        expect(() => document.body.appendChild(elm)).toLogErrorDev(
            /\[LWC error\]: Invalid tabindex value `.+` in template/
        );

        // Check if the value is normalized
        expect(elm.shadowRoot.querySelector('div').getAttribute('tabindex')).toBe('0');
    });
}

validAttribute(0, '0');
validAttribute(-1, '-1');

invalidAttribute(1);
invalidAttribute(Infinity);
