import { createElement } from 'test-utils';

import Test from 'x/test';

it('should set the composed property to true when invoking click() on an element', () => {
    let clickEvent;

    const elm = document.createElement('div');
    document.body.appendChild(elm);

    elm.addEventListener('click', evt => {
        clickEvent = evt;
    });

    elm.click();

    expect(clickEvent instanceof Event).toBe(true);
    // TODO: remove this condition again once Sauce Labs supports Safari version >= 12.0.0
    if (!process.env.NATIVE_SHADOW) {
        expect(clickEvent.composed).toBe(true);
    }
});

// The composed-event-click-polyfill doesn't work when native Shadow DOM is enabled on Safari 12.0.0 (it has been fixed
// with Safari 12.0.1). The polyfill only patches the event javascript wrapper and doesn't have any effect on how Webkit
// make the event bubbles.
// TODO: Enable this test again once Sauce Labs supports Safari version >= 12.0.0
xit('should let the event bubble throws the shadow root when invoking click() on an element in the shadow', () => {
    let clickEvent;

    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);
    elm.addEventListener('click', evt => {
        clickEvent = evt;
    });

    elm.shadowRoot.querySelector('div').click();

    expect(clickEvent instanceof Event).toBe(true);
    expect(clickEvent.composed).toBe(true);
});
