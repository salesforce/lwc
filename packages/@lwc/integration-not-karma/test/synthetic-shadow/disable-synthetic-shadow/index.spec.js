import { createElement, setFeatureFlagForTest } from 'lwc';
import { IS_SYNTHETIC_SHADOW_LOADED, isSyntheticShadowRootInstance } from 'test-utils';
import Component from 'x/component';

describe.runIf(IS_SYNTHETIC_SHADOW_LOADED && !process.env.FORCE_NATIVE_SHADOW_MODE_FOR_TEST)(
    'DISABLE_SYNTHETIC_SHADOW',
    () => {
        describe('flag disabled', () => {
            it('renders synthetic shadow', () => {
                const elm = createElement('x-component', { is: Component });
                document.body.appendChild(elm);
                expect(isSyntheticShadowRootInstance(elm.shadowRoot)).toBe(true);
            });
        });

        describe('flag enabled', () => {
            beforeEach(() => {
                setFeatureFlagForTest('DISABLE_SYNTHETIC_SHADOW', true);
            });

            afterEach(() => {
                setFeatureFlagForTest('DISABLE_SYNTHETIC_SHADOW', false);
            });

            it('renders native shadow', () => {
                const elm = createElement('x-component', { is: Component });
                document.body.appendChild(elm);
                expect(isSyntheticShadowRootInstance(elm.shadowRoot)).toBe(false);
            });
        });
    }
);
