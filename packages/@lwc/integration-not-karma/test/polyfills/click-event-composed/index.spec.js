import { createElement } from 'lwc';

import Test from 'x/test';

it('should set the composed property to true when invoking click() on an element', () => {
    let clickEvent;

    const elm = document.createElement('div');
    document.body.appendChild(elm);

    elm.addEventListener('click', (evt) => {
        clickEvent = evt;
    });

    elm.click();

    expect(clickEvent instanceof Event).toBe(true);
    expect(clickEvent.composed).toBe(true);
});

it('should let the event bubble throws the shadow root when invoking click() on an element in the shadow', () => {
    let clickEvent;

    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);
    elm.addEventListener('click', (evt) => {
        clickEvent = evt;
    });

    elm.shadowRoot.querySelector('div').click();

    expect(clickEvent instanceof Event).toBe(true);
    expect(clickEvent.composed).toBe(true);
});
