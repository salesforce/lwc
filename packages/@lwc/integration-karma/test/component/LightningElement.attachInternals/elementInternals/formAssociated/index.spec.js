import { createElement } from 'lwc';

import NotFormAssociated from 'x/notFormAssociated';
import FormAssociated from 'x/formAssociated';

if (typeof ElementInternals !== 'undefined' && !process.env.SYNTHETIC_SHADOW_ENABLED) {
    // Verify ElementInternals proxy getter throws error.
    it('form-related operations and attributes should throw DOMException for non-form-associated custom elements.', () => {
        const control = createElement('x-not-form-associated', { is: NotFormAssociated });
        expect(() => control.internals.setFormValue('')).toThrowError(
            /The target element is not a form-associated custom element./
        );
        expect(() => control.internals.form).toThrowError(
            /The target element is not a form-associated custom element./
        );
        expect(() => control.internals.setValidity({})).toThrowError(
            /The target element is not a form-associated custom element./
        );
        expect(() => control.internals.willValidate).toThrowError(
            /The target element is not a form-associated custom element./
        );
        expect(() => control.internals.validity).toThrowError(
            /The target element is not a form-associated custom element./
        );
        expect(() => control.internals.validationMessage).toThrowError(
            /The target element is not a form-associated custom element./
        );
        expect(() => control.internals.checkValidity()).toThrowError(
            /The target element is not a form-associated custom element./
        );
        expect(() => control.internals.reportValidity()).toThrowError(
            /The target element is not a form-associated custom element./
        );
        expect(() => control.internals.labels).toThrowError(
            /The target element is not a form-associated custom element./
        );
    });

    const createControlElm = () => {
        const form = document.createElement('form');
        const control = createElement('x-form-associated', { is: FormAssociated });
        document.body.appendChild(form);
        form.appendChild(control);
        return control;
    };

    // Verify ElementInternals proxy getter does not throw error.
    it('form-related operations and attributes should not throw for form-associated custom elements.', () => {
        const control = createControlElm();
        expect(() => control.internals.setFormValue).not.toThrowError();
        expect(() => control.internals.form).not.toThrowError();
        expect(() => control.internals.setValidity).not.toThrowError();
        expect(() => control.internals.willValidate).not.toThrowError();
        expect(() => control.internals.validity).not.toThrowError();
        expect(() => control.internals.validationMessage).not.toThrowError();
        expect(() => control.internals.checkValidity).not.toThrowError();
        expect(() => control.internals.reportValidity).not.toThrowError();
        expect(() => control.internals.labels).not.toThrowError();
    });

    // Verify basic functionality works correctly in presence of proxy.
    it('form-related operations and attributes sanity test', () => {
        const control = createControlElm();
        const form = document.body.querySelector('form');

        // form association
        expect(control.internals.form).toEqual(form);
        expect(() => control.internals.setFormValue('on', 'checked')).not.toThrowError();

        // form validation
        expect(() =>
            control.internals.setValidity({ valueMissing: true }, 'value missing')
        ).not.toThrowError();
        expect(control.internals.validity.valueMissing).toBe(true);
        expect(control.internals.willValidate).toBe(true);
        expect(control.internals.validationMessage).toEqual('value missing');
        expect(control.internals.checkValidity()).toBe(false);
        expect(control.internals.reportValidity()).toBe(false);

        // label association
        const label = document.createElement('label');
        label.setAttribute('for', 'mc');
        control.setAttribute('id', 'mc');
        document.body.appendChild(label);
        expect(label.control).toEqual(control);
        expect(label.form).toEqual(control.internals.form);
    });
}
