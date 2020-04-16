import { createElement } from 'lwc';
import Container from 'x/container';

describe('Event Target on window event listener', () => {
    it('should return correct target', function () {
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
