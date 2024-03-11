import { createElement } from 'lwc';
import {
    ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE,
    ENABLE_ELEMENT_INTERNALS_AND_FACE,
} from 'test-utils';

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

const createFaceTests = (tagName, ctor, callback) => {
    const scenarios = ['lwc.createElement', 'CustomElementConstructor'];

    scenarios.forEach((scenario) => {
        describe(scenario, () => {
            const createFace = () => {
                if (scenario === 'lwc.createElement') {
                    return createFaceUsingLwcCreateElement(`face-${tagName}`, ctor);
                } else {
                    return createFaceUsingCec(`cec-face-${tagName}`, ctor.CustomElementConstructor);
                }
            };

            callback(createFace, scenario);
        });
    });
};

const createFaceUsingLwcCreateElement = (tagName, ctor) => {
    let elm;
    const doCreate = () => {
        elm = createElement(tagName, { is: ctor });
    };
    if (ENABLE_ELEMENT_INTERNALS_AND_FACE) {
        doCreate();
    } else {
        expect(doCreate).toLogWarningDev(
            /set static formAssociated to true, but form association is not enabled/
        );
    }
    return elm;
};

const createFaceUsingCec = (tagName, ctor) => {
    if (!customElements.get(tagName)) {
        customElements.define(tagName, ctor);
    }
    return document.createElement(tagName);
};

const faceSanityTest = (tagName, ctor) => {
    createFaceTests(`${tagName}-form-associated`, ctor, (createFace) => {
        let form;
        let face;

        beforeEach(() => {
            face = createFace();
            form = createFormElement();
            form.appendChild(face);
        });

        it('cannot access formAssociated outside of a component', () => {
            expect(() => face.formAssociated).toLogWarningDev(
                /formAssociated cannot be accessed outside of a component. Set the value within the component class./
            );
        });

        it('calls face lifecycle methods', () => {
            testFaceLifecycleMethodsCallable(() => face);
        });

        it('is associated with the correct form', () => {
            const form2 = document.createElement('form');
            form2.setAttribute('class', 'form2');
            const face2 = createElement('face-form-associated-2', { is: ctor });
            form2.appendChild(face2);
            const container = document.body.querySelector('face-container');
            container.shadowRoot.appendChild(form2);

            if (ENABLE_ELEMENT_INTERNALS_AND_FACE) {
                expect(face.internals.form.className).toEqual('form1');
                expect(face2.internals.form.className).toEqual('form2');
            }
        });
    });
};

const testFaceLifecycleMethodsCallable = (createFace) => {
    const face = createFace();
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
    createFaceTests(`${tagName}-not-form-associated`, ctor, (createFace) => {
        it(`doesn't call face lifecycle methods when not form associated`, () => {
            testFaceLifecycleMethodsNotCallable(createFace);
        });
    });
};

const testFaceLifecycleMethodsNotCallable = (createFace) => {
    const face = createFace();
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
    if (ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE) {
        // native lifecycle enabled
        describe('native lifecycle', () => {
            if (process.env.NATIVE_SHADOW) {
                describe('native shadow', () => {
                    faceSanityTest('native-shadow', FormAssociated);
                    notFormAssociatedSanityTest('native-shadow', NotFormAssociated);
                });
            } else {
                describe('synthetic shadow', () => {
                    createFaceTests('synthetic-shadow', FormAssociated, (createFace) => {
                        it('cannot be used and throws an error', () => {
                            const face = createFace();
                            const form = createFormElement();
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
                createFaceTests(tagName, ctor, (createFace, scenario) => {
                    if (scenario === 'lwc.createElement') {
                        it(`${name} does not call face lifecycle methods when upgraded by LWC`, () => {
                            testFaceLifecycleMethodsNotCallable(createFace);
                        });
                    } else {
                        // Face throws error message when synthetic shadow is enabled
                        if (name === 'light DOM' || process.env.NATIVE_SHADOW) {
                            it(`${name} calls face lifecycle methods when using CustomElementConstructor`, () => {
                                // CustomElementConstructor is to be upgraded independently of LWC, it will always use native lifecycle
                                testFaceLifecycleMethodsCallable(createFace);
                            });
                        } else {
                            // synthetic shadow mode
                            it(`${name} cannot call face lifecycle methods when using CustomElementConstructor`, () => {
                                // this is always a callback reaction error, even in "synthetic lifecycle" mode,
                                // because synthetic lifecycle mode only includes connected/disconnected callbacks,
                                // not the FACE callbacks
                                expect(() => {
                                    const face = createFace();
                                    const form = createFormElement();
                                    form.appendChild(face);
                                }).toThrowCallbackReactionErrorEvenInSyntheticLifecycleMode(
                                    'Form associated lifecycle methods are not available in synthetic shadow. Please use native shadow or light DOM.'
                                );
                            });
                        }
                    }
                });
            });
        });
    }
}
