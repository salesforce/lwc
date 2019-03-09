import { createElement } from 'test-utils';

import Parent from 'x/parent';

describe('Issue #1090', () => {
    beforeAll(() => {
        // Ignore the engine logging about passing slot content to a component that does not accept slot
        spyOn(console, 'group');
        spyOn(console, 'log');
        spyOn(console, 'groupEnd');
    });

    it('should disconnect slotted content even if it is not allocated into a slot', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        expect(() => {
            document.body.removeChild(elm);
        }).not.toThrow();
    });
});
