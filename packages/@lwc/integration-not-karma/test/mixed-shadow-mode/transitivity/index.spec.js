import { createElement } from 'lwc';

import ResetExtendsAny from 'c/resetExtendsAny';
import LightContainer from 'c/lightContainer';
import NativeContainer from 'c/nativeContainer';
import {
    isNativeShadowRootInstance,
    isSyntheticShadowRootInstance,
} from '../../../helpers/utils.js';

describe.skipIf(process.env.NATIVE_SHADOW)('transitivity', () => {
    describe('when root component shadowSupportMode="native"', () => {
        let elm;

        beforeEach(() => {
            elm = createElement('c-native-container', { is: NativeContainer });
            document.body.appendChild(elm);
        });

        it('should attach a native shadow root when possible', () => {
            expect(isNativeShadowRootInstance(elm.shadowRoot)).toBeTrue();
        });

        it('should not attach shadow root for child light component', () => {
            const light = elm.shadowRoot.querySelector('c-light-container');
            expect(light.shadowRoot).toBeNull();
        });

        it('should attach a native shadow root when possible for child synthetic component', () => {
            const light = elm.shadowRoot.querySelector('c-light-container');
            const synthetic = light.querySelector('c-synthetic');
            expect(isNativeShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
        });

        it('should attach a native shadow root when possible for child synthetic component with shadowSupportMode="reset"', () => {
            const light = elm.shadowRoot.querySelector('c-light-container');
            const synthetic = light.querySelector('c-synthetic-reset');
            expect(isNativeShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
        });

        it('should attach a native shadow root when possible for slotted synthetic', () => {
            const light = elm.shadowRoot.querySelector('c-light-container');
            const synthetic = light.querySelector('c-synthetic.slot-slotted');
            expect(isNativeShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
        });
    });

    describe('when root component renderMode="light"', () => {
        let elm;

        beforeEach(() => {
            elm = createElement('c-light-container', { is: LightContainer });
            document.body.appendChild(elm);
        });

        it('should not attach shadow root', () => {
            expect(elm.shadowRoot).toBeNull();
        });

        it('should attach a synthetic shadow root for child synthetic component', () => {
            const synthetic = elm.querySelector('c-synthetic');
            expect(isSyntheticShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
        });

        it('should attach a synthetic shadow root for slotted synthetic component', () => {
            const synthetic = elm.querySelector('c-synthetic.slot-slotted');
            expect(isSyntheticShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
        });

        it('should attach a synthetic shadow root to child component slotted into native component', () => {
            const synthetic = elm.querySelector('c-synthetic.native-slotted');
            expect(isSyntheticShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
        });
    });

    describe('when overriding with shadowSupportMode="reset"', () => {
        let elm;

        beforeEach(() => {
            elm = createElement('c-reset-extends-any', {
                is: ResetExtendsAny,
            });
            document.body.appendChild(elm);
        });

        it('should attach a synthetic shadow root', () => {
            expect(isSyntheticShadowRootInstance(elm.shadowRoot)).toBeTrue();
        });

        it('should attach synthetic shadow root for descendant synthetic component', () => {
            const light = elm.shadowRoot.querySelector('c-light-container');
            const synthetic = light.querySelector('c-synthetic');
            expect(isSyntheticShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
        });
    });
});
