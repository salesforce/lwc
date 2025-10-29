import { createElement } from 'lwc';

import ParentWithScopedSlotContent from 'c/parentWithScopedSlotContent';
import ParentWithStandardSlotContent from 'c/parentWithStandardSlotContent';
import { USE_COMMENTS_FOR_FRAGMENT_BOOKENDS } from '../../../../helpers/constants.js';

const vFragBookend = USE_COMMENTS_FOR_FRAGMENT_BOOKENDS ? '<!---->' : '';

describe('runtime validation of slot content and slot', () => {
    it('Ignores content when parent uses scoped slot and child has standard slot', () => {
        const elm = createElement('c-parent', { is: ParentWithScopedSlotContent });
        elm.lightDomChildWithStandardSlots = true;
        expect(() => {
            document.body.appendChild(elm);
        }).toLogErrorDev(/Mismatched slot types for \(default\) slot./gm);
        const child = elm.shadowRoot.querySelector('c-child-with-standard-slots');
        // The child's default content for that <slot> is ignored too
        expect(child.innerHTML).toBe(`${vFragBookend}${vFragBookend}`);
    });

    it('Ignores content when parent uses standard slot and child has scoped slot', () => {
        const elm = createElement('c-parent', { is: ParentWithStandardSlotContent });
        expect(() => {
            document.body.appendChild(elm);
        }).toLogErrorDev(/Mismatched slot types for \(default\) slot./gm);
        const child = elm.shadowRoot.querySelector('c-child-with-scoped-slots');
        // The child's default content for that <slot> is ignored too
        expect(child.innerHTML).toBe(`${vFragBookend}${vFragBookend}`);
    });

    it('Ignores content when parent uses scoped slot on child using shadow dom', () => {
        const errors = [/Invalid usage of 'lwc:slot-data' on <c-shadow-dom-child>/gm];
        // Since allocateInSlot() is not run for children with shadow dom and in native shadow,
        // the runtime checks for each slot cannot be performed.
        if (!process.env.NATIVE_SHADOW) {
            errors.push(/Mismatched slot types for \(default\) slot./gm);
        }
        const elm = createElement('c-parent', { is: ParentWithScopedSlotContent });
        elm.shadowDomChildWithStandardSlots = true;
        expect(() => {
            document.body.appendChild(elm);
        }).toLogErrorDev(errors);
    });
});
