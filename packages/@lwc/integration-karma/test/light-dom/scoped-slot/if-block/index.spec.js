import { createElement } from 'lwc';
import { vFragBookEndEnabled } from 'test-utils';

import MixedSlotParent from 'x/mixedSlotParent';

const vFragBookend = vFragBookEndEnabled ? '<!---->' : '';

describe('if-block', () => {
    it('should work when parent and child have matching slot types', () => {
        const elm = createElement('x-parent', { is: MixedSlotParent });
        elm.showStandard = true;
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-mixed-slot-child');
        expect(child.innerHTML).toBe(
            `${vFragBookend}${vFragBookend}<span>Slotted content from parent</span>${vFragBookend}${vFragBookend}`
        );

        // Switch off the if branch and switch on the elseif branch
        elm.showStandard = false;
        elm.showVariant = true;
        return Promise.resolve().then(() => {
            expect(child.innerHTML).toBe(
                `${vFragBookend}${vFragBookend}${vFragBookend}<span>1 - slots and if block</span>${vFragBookend}${vFragBookend}${vFragBookend}`
            );
        });
    });

    it('should throw error when parent and child have mismatched slot types', () => {
        let errorMsg;
        const consoleErrorSpy = spyOn(console, 'error').and.callFake((error) => {
            errorMsg = error.message;
        });
        const elm = createElement('x-parent', { is: MixedSlotParent });
        elm.showStandard = true;
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-mixed-slot-child');

        // Switch off the if branch and switch on the elseif branch
        elm.showStandard = false;
        elm.showVariant = true;
        return Promise.resolve()
            .then(() => {
                child.switchFromVariantToStandard();
            })
            .then(() => {
                if (process.env.NODE_ENV === 'production') {
                    expect(consoleErrorSpy).not.toHaveBeenCalled();
                } else {
                    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
                    expect(errorMsg).toMatch(/Mismatched slot types for \(default\) slot/);
                }
                expect(child.innerHTML).toBe(
                    `${vFragBookend}${vFragBookend}${vFragBookend}${vFragBookend}`
                );
            });
    });
});
