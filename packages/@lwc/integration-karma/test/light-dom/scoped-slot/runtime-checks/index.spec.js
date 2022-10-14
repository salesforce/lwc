import { createElement } from 'lwc';

import ParentWithScopedSlotContent from 'x/parentWithScopedSlotContent';
import ParentWithStandardSlotContent from 'x/parentWithStandardSlotContent';

describe('runtime validation of slot content and slot', () => {
    it('Ignores content when parent uses scoped slot and child has standard slot', () => {
        const elm = createElement('x-parent', { is: ParentWithScopedSlotContent });
        expect(() => {
            document.body.appendChild(elm);
        }).toLogErrorDev(/Mismatched slot types for \(default\) slot./gm);
    });

    it('Ignores content when parent uses standard slot and child has scoped slot', () => {
        const elm = createElement('x-parent', { is: ParentWithStandardSlotContent });
        expect(() => {
            document.body.appendChild(elm);
        }).toLogErrorDev(/Mismatched slot types for \(default\) slot./gm);
    });
});
