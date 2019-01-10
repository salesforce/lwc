import { createElement } from 'test-utils';

import Test from 'x/test';

it('should set the composed property to true when invoking click() on an element', () => {
    let clickEvent;

    const elm = document.createElement('div');
    elm.addEventListener('click', evt => {
        clickEvent = evt;
    });

    elm.click();
    expect(clickEvent.composed).toBe(true);
});

it('should let the event bubble throws the shadow root when invoking click() on an element in the shadow', () => {
    let clickEvent;

    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);
    elm.addEventListener('click', evt => {
        clickEvent = evt;
    })

    elm.shadowRoot.querySelector('div').click();
    expect(clickEvent).not.toBe(undefined);
    expect(clickEvent.composed).toBe(true);
});


// TODO: Need to migrate the 2 remaining tests. I don't understand why/what they are testing.
