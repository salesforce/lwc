import { createElement } from 'lwc';
import Container from 'x/container';

describe('Non-composed events', () => {
    it('should dispatch Event on the custom element', function () {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        const child = elm.shadowRoot.querySelector('x-child');
        child.shadowRoot.querySelector('div').click();

        return Promise.resolve().then(() => {
            const elementWithResult = elm.shadowRoot.querySelector('.event-received-indicator');

            expect(elementWithResult).not.toBeNull();
        });
    });

    it('should dispatch CustomEvent on the custom element', function () {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        const child = elm.shadowRoot.querySelector('x-child');
        child.shadowRoot.querySelector('div').click();

        return Promise.resolve().then(() => {
            const elementWithResult = elm.shadowRoot.querySelector(
                '.custom-event-received-indicator'
            );

            expect(elementWithResult).not.toBeNull();
        });
    });
});
