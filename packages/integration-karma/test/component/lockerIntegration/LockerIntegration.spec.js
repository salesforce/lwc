import { createElement } from 'lwc';

import LockerIntegration from 'x/lockerIntegration';

describe('integration', () => {
    describe('with locker', () => {
        it('should support manual construction', () => {
            const elm = createElement('x-parent', { is: LockerIntegration });
            document.body.appendChild(elm);
        });
    });
});
