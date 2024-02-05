import { createElement } from 'lwc';
import { vFragBookEndEnabled } from 'test-utils';

import ParentWithScopedSlotContent from 'x/parentWithScopedSlotContent';
import ParentWithStandardSlotContent from 'x/parentWithStandardSlotContent';

const vFragBookend = vFragBookEndEnabled ? '<!---->' : '';

describe('runtime validation of slot content and slot', () => {
    it('Ignores content when parent uses scoped slot and child has standard slot', () => {
        const elm = createElement('x-parent', { is: ParentWithScopedSlotContent });
        elm.lightDomChildWithStandardSlots = true;
        expect(() => {
            document.body.appendChild(elm);
        }).toLogErrorDev(/Mismatched slot types for \(default\) slot./gm);
        const child = elm.shadowRoot.querySelector('x-child-with-standard-slots');
        // The child's default content for that <slot> is ignored too
        expect(child.innerHTML).toBe(`${vFragBookend}${vFragBookend}`);
    });

    it('Ignores content when parent uses standard slot and child has scoped slot', () => {
        const elm = createElement('x-parent', { is: ParentWithStandardSlotContent });
        expect(() => {
            document.body.appendChild(elm);
        }).toLogErrorDev(/Mismatched slot types for \(default\) slot./gm);
        const child = elm.shadowRoot.querySelector('x-child-with-scoped-slots');
        // The child's default content for that <slot> is ignored too
        expect(child.innerHTML).toBe(`${vFragBookend}${vFragBookend}`);
    });

    it('Ignores content when parent uses scoped slot on child using shadow dom', () => {
        const errors = [/Invalid usage of 'lwc:slot-data' on <x-shadow-dom-child>/gm];
        // Since allocateInSlot() is not run for children with shadow dom and in native shadow,
        // the runtime checks for each slot cannot be performed.
        if (!process.env.NATIVE_SHADOW) {
            errors.push(/Mismatched slot types for \(default\) slot./gm);
        }
        const elm = createElement('x-parent', { is: ParentWithScopedSlotContent });
        elm.shadowDomChildWithStandardSlots = true;
        expect(() => {
            document.body.appendChild(elm);
        }).toLogErrorDev(errors);
    });
});
