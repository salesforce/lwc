import { createElement } from 'lwc';
import Container from 'x/container';

describe('Event target in slot elements', () => {
    it('should receive event with correct event.target in a shadowRoot listener', function () {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        const child = elm.shadowRoot.querySelector('x-child');
        child.click();

        return Promise.resolve().then(() => {
            const elementWithResult = elm.shadowRoot.querySelector('.event-target-correct');
            expect(elementWithResult).not.toBeNull();
            expect(elementWithResult.innerText).toBe('Event Target is correct element');
        });
    });
});
