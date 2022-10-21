import { createElement } from 'lwc';

import MixedSlotParent from 'x/mixedSlotParent';

// TODO [#3107]: If block has an issue with resolving slot content from vfragment node
xdescribe('if-block', () => {
    it('should work when parent and child have matching slot types', () => {
        const elm = createElement('x-parent', { is: MixedSlotParent });
        elm.showStandard = true;
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-mixed-slot-child');
        expect(child.innerHTML).toBe('<span>Slotted content from parent</span>');

        // Switch off the if branch and switch on the elseif branch
        elm.showStandard = false;
        elm.showVariant = true;
        return Promise.resolve().then(() => {
            expect(child.innerHTML).toBe('<span>1 - slots and if block</span>');
        });
    });

    xit('should throw error when parent and child have mismatched slot types', () => {
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
                expect(child.innerHTML).toBe('<span>1 - slots and if block</span>');
            });
    });
});
