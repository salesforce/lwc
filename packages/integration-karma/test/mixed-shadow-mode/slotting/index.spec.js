import { createElement, setFeatureFlagForTest } from 'lwc';

import NativeParent from 'x/nativeParent';
import SyntheticParent from 'x/syntheticParent';

if (!process.env.COMPAT) {
    describe('slotting in mixed shadow mode', () => {
        beforeEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', true);
        });

        afterEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', false);
        });

        it('should keep default slotting content in native shadow mode', () => {
            const nativeParent = createElement('x-native-parent', { is: NativeParent });
            document.body.appendChild(nativeParent);

            const childElm = nativeParent.shadowRoot.querySelector('x-child');
            expect(childElm.shadowRoot.querySelector('slot').innerHTML).toBe(
                '<span>default text</span>'
            );
        });

        if (!process.env.NATIVE_SHADOW) {
            it('should not have default slotting content in synthetic shadow mode', () => {
                const syntheticParent = createElement('x-synthetic-parent', {
                    is: SyntheticParent,
                });
                document.body.appendChild(syntheticParent);

                const childElm = syntheticParent.shadowRoot.querySelector('x-child');
                expect(childElm.shadowRoot.querySelector('slot').innerHTML).toBe('');
            });
        }
    });
}
