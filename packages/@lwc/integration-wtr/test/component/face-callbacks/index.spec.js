import { createElement } from 'lwc';

import Container from 'x/container';
import FormAssociated from 'x/formAssociated';
import NotFormAssociated from 'x/notFormAssociated';
import LightDomFormAssociated from 'x/lightDomFormAssociated';
import LightDomNotFormAssociated from 'x/lightDomNotFormAssociated';
import { ENABLE_ELEMENT_INTERNALS_AND_FACE } from '../../../helpers/constants.js';

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
            document.body.appendChild(form2);
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
    expect(face.formAssociatedCallbackHasBeenCalledWith).toBe(form);

    // formDisabledCallback
    face.setAttribute('disabled', 'true');
    expect(face.formDisabledCallbackHasBeenCalled).toBeTruthy();
    expect(face.formDisabledCallbackHasBeenCalledWith).toBe(true);

    // formDisabledCallback - re-enable
    face.removeAttribute('disabled');
    expect(face.formDisabledCallbackHasBeenCalled).toBeTruthy();
    expect(face.formDisabledCallbackHasBeenCalledWith).toBe(false);

    // formResetCallback
    form.reset();
    expect(face.formResetCallbackHasBeenCalled).toBeTruthy();
    expect(face.formResetCallbackHasBeenCalledWith).toBeUndefined();

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

describe.runIf(typeof ElementInternals !== 'undefined')('ElementInternals', () => {
    // native lifecycle enabled
    describe.runIf(ENABLE_ELEMENT_INTERNALS_AND_FACE)('ElementInternals/FACE enabled', () => {
        describe.runIf(process.env.NATIVE_SHADOW)('native shadow', () => {
            faceSanityTest('native-shadow', FormAssociated);
            notFormAssociatedSanityTest('native-shadow', NotFormAssociated);
        });
        describe.skipIf(process.env.NATIVE_SHADOW)('synthetic shadow', () => {
            faceSanityTest('synthetic-shadow', FormAssociated);
            notFormAssociatedSanityTest('synthetic-shadow', NotFormAssociated);
        });
        describe('light DOM', () => {
            faceSanityTest('light-dom', LightDomFormAssociated);
            notFormAssociatedSanityTest('light-dom', LightDomNotFormAssociated);
        });
    });

    describe.skipIf(ENABLE_ELEMENT_INTERNALS_AND_FACE)('ElementInternals/FACE disabled', () => {
        [
            { name: 'shadow DOM', tagName: 'synthetic-lifecycle-shadow', ctor: FormAssociated },
            {
                name: 'light DOM',
                tagName: 'synthetic-lifecycle-light',
                ctor: LightDomFormAssociated,
            },
        ].forEach(({ name, tagName, ctor }) => {
            createFaceTests(tagName, ctor, (createFace, scenario) => {
                it.runIf(scenario === 'lwc.createElement')(
                    `${name} does not call face lifecycle methods when upgraded by LWC`,
                    () => {
                        testFaceLifecycleMethodsNotCallable(createFace);
                    }
                );

                describe.skipIf(scenario === 'lwc.createElement')(name, () => {
                    it(`${name} calls face lifecycle methods when using CustomElementConstructor`, () => {
                        // CustomElementConstructor is to be upgraded independently of LWC, it will always use native lifecycle
                        testFaceLifecycleMethodsCallable(createFace);
                    });
                });
            });
        });
    });
});
