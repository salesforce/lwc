import { createElement } from 'lwc';

import DelegatesFocusTrue from 'x/delegatesFocusTrue';
import DelegatesFocusFalse from 'x/delegatesFocusFalse';

// TODO: #1330 - Enable this test after Chrome fixes this bug
xit('should have a default tabIndex value of -1 when delegatesFocus=true', () => {
    const elm = createElement('x-tabindex', { is: DelegatesFocusTrue });
    document.body.appendChild(elm);
    expect(elm.tabIndex).toBe(-1);
});

it('should have a default tabIndex value of -1 when delegatesFocus=false', () => {
    const elm = createElement('x-tabindex', { is: DelegatesFocusFalse });
    document.body.appendChild(elm);
    expect(elm.tabIndex).toBe(-1);
});
