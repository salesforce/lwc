import { createElement } from 'test-utils';

import Test from 'x/test';
import NonExistingEventListener from 'x/nonExistingEventListener';

it('should remove existing event listeners', () => {
    let isInvoked = false;

    const listener = () => {
        isInvoked = true;
    };

    const elm = createElement('x-test', { is: Test });
    elm.listener = listener;
    document.body.appendChild(elm);

    elm.click();
    expect(isInvoked).toBe(true);

    isInvoked = false;
    elm.removeListener();
    elm.click();
    expect(isInvoked).toBe(false);
});

// TODO: #1043 inconsistent restriction between native shadow and synthetic shadow
xit('should log an error message when removing a non existing event handler', () => {
    const elm = createElement('x-non-existing-event-listener', { is: NonExistingEventListener });

    spyOn(console, 'error');
    document.body.appendChild(elm);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error.calls.argsFor(0)[0]).toMatch(
            /\[LWC error\]: Did not find event listener for event "click" executing removeEventListener on \[object HTMLElement\]. This is probably a typo or a life cycle mismatch. Make sure that you add the right event listeners in the connectedCallback\(\) hook and remove them in the disconnectedCallback\(\) hook./
    );
});
