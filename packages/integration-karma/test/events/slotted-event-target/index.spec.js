import { createElement } from 'lwc';
import Container from 'x/container';

describe('Event target in slot elements', () => {
    it('should receive event with correct target in slotted custom element', function () {
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

    it('should receive event with correct target for slotted native element', function () {
        const elm = createElement('x-container', { is: Container });
        elm.isNativeElement = true;
        document.body.appendChild(elm);

        const trigger = elm.shadowRoot.querySelector('p');
        trigger.click();

        return Promise.resolve().then(() => {
            const elementWithResult = elm.shadowRoot
                .querySelector('x-slotted-native-element')
                .shadowRoot.querySelector('.correct-event-target');

            expect(elementWithResult).not.toBeNull();
            expect(elementWithResult.innerText).toBe('Event target is correct');
        });
    });
});
