import { createElement } from 'test-utils';
import Container from 'x/container';

describe('Event Target on window event listener', () => {
    // The composed-event-click-polyfill doesn't work when native Shadow DOM is enabled on Safari 12.0.0 (it has been fixed
    // with Safari 12.0.1). The polyfill only patches the event javascript wrapper and doesn't have any effect on how Webkit
    // make the event bubbles.
    // TODO: Enable this test again once Sauce Labs supports Safari version >= 12.0.1
    // TODO: Also delete the corresponding integration-test
    xit('should return correct target', function() {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        const trigger = elm.shadowRoot.querySelector('button');
        trigger.click();

        return Promise.resolve().then(() => {
            const elementWithResult = elm.shadowRoot.querySelector('.window-event-target-tagname');

            expect(elementWithResult).not.toBeNull();
            expect(elementWithResult.innerText).toBe('x-container');
        });
    });
});
