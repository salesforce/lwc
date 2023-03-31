import { createElement } from 'lwc';

import Container from 'x/container';

describe('Event.currentTarget', () => {
    it('should be null when accessed asynchronously', function (done) {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        container.addEventListener('test', (event) => {
            expect(event.currentTarget).toEqual(container);
            setTimeout(() => {
                expect(event.currentTarget).toBeNull();
                done();
            });
        });
        const div = container.shadowRoot.querySelector('div');
        div.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
    });

    it('should reference the host element', (done) => {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        container.addEventListener('test', (event) => {
            expect(event.currentTarget).toEqual(container);
            done();
        });

        const child = container.shadowRoot.querySelector('x-child');
        child.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
    });

    it('should reference the shadow root', (done) => {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        container.shadowRoot.addEventListener('test', (event) => {
            expect(event.currentTarget).toEqual(container.shadowRoot);
            done();
        });

        const child = container.shadowRoot.querySelector('x-child');
        child.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
    });
});
