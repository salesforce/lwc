import { createElement, setFeatureFlagForTest } from 'lwc';

import Parent from 'x/parent';

if (!process.env.COMPAT) {
    describe('slotting in mixed shadow mode', () => {
        beforeEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', true);
        });

        afterEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', false);
        });

        it('should keep default slotting content in native shadow mode', () => {
            const parent = createElement('x-parent', { is: Parent });
            document.body.appendChild(parent);

            const childElm = parent.shadowRoot.querySelector('x-child');
            expect(childElm.shadowRoot.querySelector('slot').innerHTML).toBe(
                '<span>default text</span>'
            );
        });
    });
}
