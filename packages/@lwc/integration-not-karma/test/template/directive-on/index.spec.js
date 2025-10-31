import { createElement } from 'lwc';

import Click from 'c/click';
import Test from 'c/test';

it('adds supports standard events', () => {
    let event;

    const elm = createElement('c-click', { is: Click });
    elm.eventCallback = (e) => (event = e);
    document.body.appendChild(elm);

    const target = elm.shadowRoot.querySelector('div');
    target.click();

    expect(event).not.toBeUndefined();
    expect(event.type).toBe('click');
});

it('adds supports custom events', () => {
    let event;

    const elm = createElement('c-test', { is: Test });
    elm.eventCallback = (e) => (event = e);
    document.body.appendChild(elm);

    const target = elm.shadowRoot.querySelector('div');
    target.dispatchEvent(new CustomEvent('test'));

    expect(event).not.toBeUndefined();
    expect(event.type).toBe('test');
});
