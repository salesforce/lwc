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
    return container.shadowRoot.querySelector('form');
};

const createFaces = (tagName, ctor) => [
    createElement(`face-${tagName}`, { is: ctor }),
    createFaceUsingCec(`cec-face-${tagName}`, ctor.CustomElementConstructor),
];

const createFaceUsingCec = (tagName, ctor) => {
    if (!customElements.get(tagName)) {
        customElements.define(tagName, ctor);
    }
    return document.createElement(tagName);
};

const faceSanityTest = (tagName, ctor) => {
    createFaces(`${tagName}-form-associated`, ctor).forEach((face) => {
        let form;

        beforeEach(() => {
            form = createFormElement();
            form.appendChild(face);
        });

        it('cannot access formAssociated outside of a component', () => {
            expect(() => face.formAssociated).toLogWarningDev(
                /formAssociated cannot be accessed outside of a component. Set the value within the component class./
            );
        });

        it('calls face lifecycle methods', () => {
            testFaceLifecycleMethodsCallable(face);
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
    });
};

const testFaceLifecycleMethodsCallable = (face) => {
    const form = createFormElement();
    form.appendChild(face);

    // formAssociatedCallback
    expect(face.formAssociatedCallbackHasBeenCalled).toBeTruthy();

    // formDisabledCallback
    face.setAttribute('disabled', true);
    expect(face.formDisabledCallbackHasBeenCalled).toBeTruthy();

    // formResetCallback
    form.reset();
    expect(face.formResetCallbackHasBeenCalled).toBeTruthy();

    // Note there is no good way to test formStateRestoreCallback in karma tests
};

const notFormAssociatedSanityTest = (tagName, ctor) => {
    it(`doesn't call face lifecycle methods when not form associated`, () => {
        createFaces(`${tagName}-not-form-associated`, ctor).forEach((face) => {
            testFaceLifecycleMethodsNotCallable(face);
        });
    });
};

const testFaceLifecycleMethodsNotCallable = (face) => {
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

    // Note there is no good way to test formStateRestoreCallback in karma tests
};

if (typeof ElementInternals !== 'undefined') {
    if (nativeCustomElementLifecycleEnabled) {
        // native lifecycle enabled
        describe('native lifecycle', () => {
            if (process.env.NATIVE_SHADOW) {
                describe('native shadow', () => {
                    faceSanityTest('native-shadow', FormAssociated);
                    notFormAssociatedSanityTest('native-shadow', NotFormAssociated);
                });
            } else {
                describe('synthetic shadow', () => {
                    it('cannot be used and throws an error', () => {
                        const form = createFormElement();
                        createFaces('synthetic-shadow', FormAssociated).forEach((face) => {
                            expect(() => form.appendChild(face)).toThrowCallbackReactionError(
                                'Form associated lifecycle methods are not available in synthetic shadow. Please use native shadow or light DOM.'
                            );
                        });
                    });
                });
            }
            describe('light DOM', () => {
                faceSanityTest('light-dom', LightDomFormAssociated);
                notFormAssociatedSanityTest('light-dom', LightDomNotFormAssociated);
            });
        });
    } else {
        describe('synthetic lifecycle', () => {
            [
                { name: 'shadow DOM', tagName: 'synthetic-lifecycle-shadow', ctor: FormAssociated },
                {
                    name: 'light DOM',
                    tagName: 'synthetic-lifecycle-light',
                    ctor: LightDomFormAssociated,
                },
            ].forEach(({ name, tagName, ctor }) => {
                const [face, cecFace] = createFaces(tagName, ctor);
                it(`${name} does not call face lifecycle methods when upgraded by LWC`, () => {
                    // TODO [#3929]: Face should log a dev warning when used with synthetic lifecycle
                    testFaceLifecycleMethodsNotCallable(face);
                });

                // Face throws error message when synthetic shadow is enabled
                if (name === 'light DOM' || process.env.NATIVE_SHADOW) {
                    it(`${name} calls face lifecycle methods when using CustomElementConstructor`, () => {
                        // CustomElementConstructor is to be upgraded independently of LWC, it will always use native lifecycle
                        testFaceLifecycleMethodsCallable(cecFace);
                    });
                }
            });
        });
    }
}
