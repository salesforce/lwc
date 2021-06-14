import { createElement, setFeatureFlagForTest } from 'lwc';
import Native from 'x/native';
import NativeRenderFunc from 'x/nativeRenderFunc';
import SyntheticContainer from 'x/syntheticContainer';
import NativeContainer from 'x/nativeContainer';
import NativeLightSynthetic from 'x/nativeLightSynthetic';

if (!process.env.NATIVE_SHADOW && !process.env.COMPAT) {
    describe('composition', () => {
        describe('disallow composing synthetic within native', () => {
            it('basic case', () => {
                expect(() => {
                    const elm = createElement('x-native', { is: Native });
                    document.body.appendChild(elm);
                }).toThrowError(
                    'Assert Violation: <x-synthetic> (synthetic shadow DOM) cannot be composed inside of <x-native> (native shadow DOM), because synthetic-within-native composition is disallowed'
                );
            });

            it('dynamic render', () => {
                const elm = createElement('x-native-render-func', { is: NativeRenderFunc });
                document.body.appendChild(elm);
                expect(elm.shadowRoot.querySelector('div').textContent).toEqual('hello');
                // The code we want to test calls `Promise.resolve().then(flushCallbackQueue)`, which would result
                // in an unhandled promise rejection. To actually capture that promise, we mock `Promise.resolve`.
                let promise = Promise.resolve();
                spyOn(Promise, 'resolve').and.returnValue({
                    then: function (callback) {
                        promise = promise.then(callback);
                        return promise;
                    },
                });
                elm.tryToRenderSynthetic = true;
                return expectAsync(promise).toBeRejectedWithError(
                    'Assert Violation: <x-synthetic> (synthetic shadow DOM) cannot be composed inside of <x-native-render-func> (native shadow DOM), because synthetic-within-native composition is disallowed'
                );
            });

            it('synthetic containing slottable native component with synthetic slotted inside should not throw', () => {
                const elm = createElement('x-synthetic-container', { is: SyntheticContainer });
                document.body.appendChild(elm);
                expect(
                    elm.shadowRoot.querySelector('x-synthetic').shadowRoot.querySelector('h1')
                        .textContent
                ).toEqual('I am synthetic');
            });

            it('native containing slottable native component with synthetic slotted inside should throw', () => {
                expect(() => {
                    const elm = createElement('x-native-container', { is: NativeContainer });
                    document.body.appendChild(elm);
                }).toThrowError(
                    'Assert Violation: <x-synthetic> (synthetic shadow DOM) cannot be composed inside of <x-native-container> (native shadow DOM), because synthetic-within-native composition is disallowed'
                );
            });

            describe('using light DOM', () => {
                beforeEach(() => {
                    setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
                });
                afterEach(() => {
                    setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
                });
                it('synthetic within light within native', () => {
                    expect(() => {
                        const elm = createElement('x-native-light-synthetic', {
                            is: NativeLightSynthetic,
                        });
                        document.body.appendChild(elm);
                    }).toThrowError(
                        'Assert Violation: <x-synthetic> (synthetic shadow DOM) cannot be composed inside of <x-native-light-synthetic> (native shadow DOM), because synthetic-within-native composition is disallowed'
                    );
                });
            });
        });
    });
}
