import { createElement } from 'lwc';

import Container from 'x/container';

describe('Event.defaultPrevented', () => {
    it('should return true if cancelable and preventDefault() was invoked', (done) => {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        container.shadowRoot.addEventListener('test', (event) => {
            event.preventDefault();
        });
        container.addEventListener('test', (event) => {
            expect(event.defaultPrevented).toBeTrue();
            done();
        });

        const div = container.shadowRoot.querySelector('div');
        div.dispatchEvent(
            new CustomEvent('test', {
                bubbles: true,
                cancelable: true,
                composed: true,
            })
        );
    });

    it('should return false if cancelable and preventDefault() was not invoked', (done) => {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        container.addEventListener('test', (event) => {
            expect(event.defaultPrevented).toBeFalse();
            done();
        });

        const div = container.shadowRoot.querySelector('div');
        div.dispatchEvent(
            new CustomEvent('test', {
                bubbles: true,
                cancelable: true,
                composed: true,
            })
        );
    });

    it('should return false if not cancelable and preventDefault() was invoked', (done) => {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        container.shadowRoot.addEventListener('test', (event) => {
            event.preventDefault();
        });
        container.addEventListener('test', (event) => {
            expect(event.defaultPrevented).toBeFalse();
            done();
        });

        const div = container.shadowRoot.querySelector('div');
        div.dispatchEvent(
            new CustomEvent('test', {
                bubbles: true,
                cancelable: false,
                composed: true,
            })
        );
    });
});
