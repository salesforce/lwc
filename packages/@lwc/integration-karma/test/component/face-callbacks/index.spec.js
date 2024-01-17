import { createElement } from 'lwc';
import { nativeCustomElementLifecycleEnabled } from 'test-utils';

import Container from 'face/container';
import FormAssociated from 'face/formAssociated';
import NotFormAssociated from 'face/notFormAssociated';
import LightDomFormAssociated from 'face/lightDomFormAssociated';
import LightDomNotFormAssociated from 'face/lightDomNotFormAssociated';

const createFormElement = () => {
    const container = createElement('face-container', { is: Container });
    document.body.appendChild(container);
    const form = container.shadowRoot.querySelector('form');
    return form;
};

const faceSanityTest = (ctor) => {
    let form;
    let face;

    beforeEach(() => {
        form = createFormElement();
        face = createElement('face-form-associated', { is: ctor });
        form.appendChild(face);
    });

    it('cannot access formAssociated outside of a component', () => {
        expect(() => face.formAssociated).toLogWarningDev(
            /formAssociated cannot be accessed outside of a component. Set the value within the component class./
        );
    });

    it('calls face lifecycle methods', () => {
        // formAssociatedCallback
        expect(face.formAssociatedCallbackHasBeenCalled).toBeTruthy();

        // formDisabledCallback
        face.setAttribute('disabled', true);
        expect(face.formDisabledCallbackHasBeenCalled).toBeTruthy();

        // formResetCallback
        form.reset();
        expect(face.formResetCallbackHasBeenCalled).toBeTruthy();

        // Note there is no good way to test formStateRestoreCallback in karma tests
    });

    it('is associated with the correct form', () => {
        const form2 = document.createElement('form');
        form2.setAttribute('class', 'form2');
        const face2 = createElement('face-form-associated-2', { is: ctor });
        form2.appendChild(face2);
        const container = document.body.querySelector('face-container');
        container.shadowRoot.appendChild(form2);

        expect(face.internals.form.className).toEqual('form1');
        expect(face2.internals.form.className).toEqual('form2');
    });
};

const testWarningLoggedWhenFormAssociatedNotSet = (ctor) => {
    it(`logs a dev warning if 'static formAssociated' is not set`, () => {
        const form = createFormElement();
        const notFormAssociated = createElement('face-not-form-associated', {
            is: ctor,
        });

        expect(() => form.appendChild(notFormAssociated)).toLogWarningDev(
            /Form associated lifecycle methods must have the 'static formAssociated' value set in the component's prototype chain./
        );
    });
};

if (typeof ElementInternals !== 'undefined') {
    if (nativeCustomElementLifecycleEnabled) {
        // native lifecycle enabled
        describe('native lifecycle', () => {
            if (process.env.NATIVE_SHADOW) {
                describe('native shadow', () => {
                    faceSanityTest(FormAssociated);
                    testWarningLoggedWhenFormAssociatedNotSet(NotFormAssociated);
                });
            } else {
                describe('synthetic shadow', () => {
                    it('cannot be used and throws an error', () => {
                        const form = createFormElement();
                        const face = createElement('face-form-associated', { is: FormAssociated });

                        expect(() => form.appendChild(face)).toThrowCallbackReactionError(
                            'Form associated lifecycle methods are not available in synthetic shadow. Please use native shadow or light DOM.'
                        );
                    });
                });
            }

            describe('light DOM', () => {
                faceSanityTest(LightDomFormAssociated);
                testWarningLoggedWhenFormAssociatedNotSet(LightDomNotFormAssociated);
            });
        });
    } else {
        describe('synthetic lifecycle', () => {
            [
                { name: 'shadow DOM', is: FormAssociated },
                { name: 'light DOM', is: LightDomFormAssociated },
            ].forEach(({ name, is }) => {
                it(`${name} does not call face lifecycle methods`, () => {
                    const face = createElement('face-form-associated', { is });
                    const form = createFormElement();
                    form.appendChild(face);

                    // formAssociatedCallback
                    expect(face.formAssociatedCallbackHasBeenCalled).toBeFalsy();

                    // formDisabledCallback
                    face.setAttribute('disabled', true);
                    expect(face.formDisabledCallbackHasBeenCalled).toBeFalsy();

                    // formResetCallback
                    form.reset();
                    expect(face.formResetCallbackHasBeenCalled).toBeFalsy();
                });
            });
        });
    }
}
