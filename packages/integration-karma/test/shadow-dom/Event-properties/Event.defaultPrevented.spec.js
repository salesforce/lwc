import { createElement } from 'lwc';
import XDefaultPreventingParent from 'x/defaultPreventingParent';

it('defaultPrevented should be true after preventDefault() is invoked', function () {
    const elm = createElement('x-default-prevented-parent', { is: XDefaultPreventingParent });
    document.body.appendChild(elm);
    const child = elm.shadowRoot.querySelector('x-default-prevented-child');
    child.dispatchCancelableEvent();

    expect(elm.defaultPrevented).toBe(true);
    expect(child.defaultPrevented).toBe(true);
});
