import { createElement } from 'lwc';

import NotFormAssociated from 'x/notFormAssociated';
import FormAssociated from 'x/formAssociated';
import FormAssociatedFalse from 'x/formAssociatedFalse';
import NotFormAssociatedNoAttachInternals from 'x/notFormAssociatedNoAttachInternals';
import FormAssociatedNoAttachInternals from 'x/formAssociatedNoAttachInternals';
import FormAssociatedFalseNoAttachInternals from 'x/formAssociatedFalseNoAttachInternals';
import { ENABLE_ELEMENT_INTERNALS_AND_FACE } from '../../../../../helpers/constants.js';

const readOnlyProperties = [
    'shadowRoot',
    'states',
    'form',
    'willValidate',
    'validity',
    'validationMessage',
    'labels',
];

const formAssociatedFalsyTest = (tagName, ctor) => {
    const form = document.createElement('form');
    document.body.appendChild(form);

    const elm = createElement(`x-${tagName}`, { is: ctor });
    form.appendChild(elm);

    const { internals } = elm;
    expect(() => internals.form).toThrow();
    expect(() => internals.setFormValue('2019-03-15')).toThrow();
    expect(() => internals.willValidate).toThrow();
    expect(() => internals.validity).toThrow();
    expect(() => internals.checkValidity()).toThrow();
    expect(() => internals.reportValidity()).toThrow();
    expect(() => internals.setValidity('')).toThrow();
    expect(() => internals.validationMessage).toThrow();
    expect(() => internals.labels).toThrow();

    document.body.removeChild(form);
};

describe.runIf(ENABLE_ELEMENT_INTERNALS_AND_FACE && typeof ElementInternals !== 'undefined')(
    'should throw an error when duplicate tag name used',
    () => {
        it('with different formAssociated value', () => {
            // Register tag with formAssociated = true
            createElement('x-form-associated', { is: FormAssociated });
            // Try to register again with formAssociated = false
            expect(() =>
                createElement('x-form-associated', { is: FormAssociatedFalse })
            ).toThrowError(
                /<x-form-associated> was already registered with formAssociated=true. It cannot be re-registered with formAssociated=false. Please rename your component to have a different name than <x-form-associated>/
            );
        });

        it('should not throw when duplicate tag name used with the same formAssociated value', () => {
            // formAssociated = true
            createElement('x-form-associated', { is: FormAssociated });
            expect(() => createElement('x-form-associated', { is: FormAssociated })).not.toThrow();
            // formAssociated = false
            createElement('x-form-associated-false', { is: FormAssociatedFalse });
            expect(() =>
                createElement('x-form-associated-false', { is: FormAssociatedFalse })
            ).not.toThrow();
            // formAssociated = undefined
            createElement('x-not-form-associated', { is: NotFormAssociated });
            expect(() =>
                createElement('x-not-form-associated', { is: NotFormAssociated })
            ).not.toThrow();
        });

        it('should throw an error when accessing form related properties when formAssociated is false', () => {
            formAssociatedFalsyTest('x-form-associated-false', FormAssociatedFalse);
        });

        it('should throw an error when accessing form related properties when formAssociated is undefined', () => {
            formAssociatedFalsyTest('x-not-form-associated', NotFormAssociated);
        });

        it('should be able to use internals to validate form associated component', () => {
            const elm = createElement('x-form-associated', { is: FormAssociated });
            const { internals } = elm;
            expect(internals.willValidate).toBe(true);
            expect(internals.validity.valid).toBe(true);
            expect(internals.checkValidity()).toBe(true);
            expect(internals.reportValidity()).toBe(true);
            expect(internals.validationMessage).toBe('');

            internals.setValidity({ rangeUnderflow: true }, 'pick future date');

            expect(internals.validity.valid).toBe(false);
            expect(internals.checkValidity()).toBe(false);
            expect(internals.reportValidity()).toBe(false);
            expect(internals.validationMessage).toBe('pick future date');
        });

        it('should be able to use setFormValue on a form associated component', () => {
            const form = document.createElement('form');
            document.body.appendChild(form);

            const elm = createElement('x-form-associated', { is: FormAssociated });
            const { internals } = elm;
            form.appendChild(elm);

            expect(internals.form).toBe(form);

            elm.setAttribute('name', 'date');
            const inputElm = elm.shadowRoot
                .querySelector('x-input')
                .shadowRoot.querySelector('input');
            internals.setFormValue('2019-03-15', '3/15/2019', inputElm);
            const formData = new FormData(form);
            expect(formData.get('date')).toBe('2019-03-15');
        });

        it('should be able to associate labels to a form associated component', () => {
            const elm = createElement('x-form-associated', { is: FormAssociated });
            document.body.appendChild(elm);
            const { internals } = elm;

            expect(internals.labels.length).toBe(0);
            elm.id = 'test-id';
            const label = document.createElement('label');
            label.htmlFor = elm.id;
            document.body.appendChild(label);
            expect(internals.labels.length).toBe(1);
            expect(internals.labels[0]).toBe(label);
        });

        for (const prop of readOnlyProperties) {
            it(`should throw error when trying to set ${prop} on form associated component`, () => {
                const elm = createElement('x-form-associated', { is: FormAssociated });
                document.body.appendChild(elm);
                const { internals } = elm;
                expect(() => (internals[prop] = 'test')).toThrow();
            });
        }
    }
);

it.runIf(typeof ElementInternals !== 'undefined')(
    'disallows form association on older API versions',
    () => {
        const isFormAssociated = (elm) => {
            const form = document.createElement('form');
            document.body.appendChild(form);
            form.appendChild(elm);
            const result = elm.formAssociatedCallbackCalled;
            document.body.removeChild(form); // cleanup
            return result;
        };

        let elm;

        // formAssociated = true
        const createFormAssociatedTrue = () => {
            elm = createElement('x-form-associated-no-attach-internals', {
                is: FormAssociatedNoAttachInternals,
            });
        };
        if (ENABLE_ELEMENT_INTERNALS_AND_FACE) {
            createFormAssociatedTrue();
            expect(isFormAssociated(elm)).toBe(true);
        } else {
            expect(createFormAssociatedTrue).toLogWarningDev(
                /Component <x-form-associated-no-attach-internals> set static formAssociated to true, but form association is not enabled/
            );
            expect(isFormAssociated(elm)).toBe(false);
        }

        // formAssociated = false
        elm = createElement('x-form-associated-false-no-attach-internals', {
            is: FormAssociatedFalseNoAttachInternals,
        });
        expect(isFormAssociated(elm)).toBe(false);

        // formAssociated = undefined
        elm = createElement('x-not-form-associated-no-attach-internals', {
            is: NotFormAssociatedNoAttachInternals,
        });
        expect(isFormAssociated(elm)).toBe(false);
    }
);

it.skipIf(ENABLE_ELEMENT_INTERNALS_AND_FACE)(
    'warns for attachInternals on older API versions',
    () => {
        // formAssociated = true
        expect(() => {
            expect(() => createElement('x-form-associated', { is: FormAssociated })).toThrowError(
                /The attachInternals API is only supported in API version 61 and above/
            );
        }).toLogWarningDev(
            /Component <x-form-associated> set static formAssociated to true, but form association is not enabled/
        );

        // formAssociated = false
        expect(() =>
            createElement('x-form-associated-false', { is: FormAssociatedFalse })
        ).toThrowError(/The attachInternals API is only supported in API version 61 and above/);

        // formAssociated = undefined
        expect(() =>
            createElement('x-not-form-associated', { is: NotFormAssociated })
        ).toThrowError(/The attachInternals API is only supported in API version 61 and above/);
    }
);
