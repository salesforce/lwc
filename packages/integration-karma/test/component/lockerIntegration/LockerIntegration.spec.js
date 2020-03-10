import { createElement } from 'lwc';

import LockerIntegration from 'x/lockerIntegration';

describe('integration', () => {
    describe('with locker', () => {
        it('should support manual construction', () => {
            const elm = createElement('x-secure-parent', { is: LockerIntegration });
            document.body.appendChild(elm);
            // Verifying that shadow tree was created to ensure the component class was successfull processed
            const actual = elm.querySelector('div.secure');
            expect(actual).toBeDefined();
        });
    });
});
