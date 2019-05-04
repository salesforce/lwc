import { createElement } from 'test-utils';
import Container from 'x/container';

describe('Event target in slot elements', () => {
    it('should receive event with correct target in slotted custom element', function() {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        const child = elm.shadowRoot.querySelector('x-child');
        child.click();

        return Promise.resolve().then(() => {
            const elementWithResult = elm.shadowRoot
                .querySelector('x-parent')
                .shadowRoot.querySelector('.correct-event-target');

            expect(elementWithResult).not.toBeNull();
            expect(elementWithResult.innerText).toBe('Event target is correct');
        });
    });
});
