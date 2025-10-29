import { createElement } from 'lwc';

import Parent from 'c/parent';

describe('Issue #1090', () => {
    it('should disconnect slotted content even if it is not allocated into a slot', () => {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);
        expect(() => {
            document.body.removeChild(elm);
        }).not.toThrow();
    });
});
