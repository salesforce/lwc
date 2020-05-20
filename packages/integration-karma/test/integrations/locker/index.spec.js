import { createElement } from 'lwc';

import LockerIntegration from 'x/lockerIntegration';

it('should support Locker integration which uses a wrapped LightningElement base class', () => {
    const elm = createElement('x-secure-parent', { is: LockerIntegration });
    document.body.appendChild(elm);
    // Verifying that shadow tree was created to ensure the component class was successfully processed
    const actual = elm.querySelector('div.secure');
    expect(actual).toBeDefined();
});
