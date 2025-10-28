import { createElement } from 'lwc';
import MixedSlotParent from 'x/mixedSlotParent';
import { spyOn } from '@vitest/spy';
import { USE_COMMENTS_FOR_FRAGMENT_BOOKENDS } from '../../../../helpers/constants.js';

const vFragBookend = USE_COMMENTS_FOR_FRAGMENT_BOOKENDS ? '<!---->' : '';

describe('if-block', () => {
    let consoleErrorSpy;
    beforeAll(() => {
        consoleErrorSpy = spyOn(console, 'error');
    });
    afterEach(() => consoleErrorSpy.mockReset());
    afterAll(() => consoleErrorSpy.mockRestore());

    it('should work when parent and child have matching slot types', async () => {
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
        await Promise.resolve();
        expect(child.innerHTML).toBe(
            `${vFragBookend}${vFragBookend}${vFragBookend}<span>1 - slots and if block</span>${vFragBookend}${vFragBookend}${vFragBookend}`
        );
    });

    it('should throw error when parent and child have mismatched slot types', async () => {
        let errorMsg;
        consoleErrorSpy.mockImplementation((error) => {
            errorMsg = error.message;
        });
        const elm = createElement('x-parent', { is: MixedSlotParent });
        elm.showStandard = true;
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-mixed-slot-child');

        // Switch off the if branch and switch on the elseif branch
        elm.showStandard = false;
        elm.showVariant = true;
        await Promise.resolve();
        child.switchFromVariantToStandard();
        await Promise.resolve();
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
