import { createElement } from 'lwc';

import DelegatesFocusTrue from 'x/delegatesFocusTrue';
import DelegatesFocusFalse from 'x/delegatesFocusFalse';

// TODO: #1330 - Enable this test after we normalize the value (returns 0 only in Chrome)
xit('should have a default tabIndex value of -1 when delegatesFocus=true', () => {
    const elm = createElement('x-tabindex', { is: DelegatesFocusTrue });
    document.body.appendChild(elm);
    expect(elm.tabIndex).toBe(-1);
});

// TODO: #1330 - Enable this test after we normalize the value (returns 0 only in IE11)
xit('should have a default tabIndex value of -1 when delegatesFocus=false', () => {
    const elm = createElement('x-tabindex', { is: DelegatesFocusFalse });
    document.body.appendChild(elm);
    expect(elm.tabIndex).toBe(-1);
});
