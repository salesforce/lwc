import { createElement } from 'lwc';

import Container from 'x/container';

describe('Event.defaultPrevented', () => {
    it('should return true if cancelable and preventDefault() was invoked', async () => {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        container.shadowRoot.addEventListener('test', (event) => {
            event.preventDefault();
        });

        const defaultPrevented = await new Promise((resolve) => {
            container.addEventListener('test', (event) => {
                resolve(event.defaultPrevented);
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

        expect(defaultPrevented).toBeTrue();
    });

    it('should return false if cancelable and preventDefault() was not invoked', async () => {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        const defaultPrevented = await new Promise((resolve) => {
            container.addEventListener('test', (event) => {
                resolve(event.defaultPrevented);
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

        expect(defaultPrevented).toBeFalse();
    });

    it('should return false if not cancelable and preventDefault() was invoked', async () => {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        container.shadowRoot.addEventListener('test', (event) => {
            event.preventDefault();
        });

        const defaultPrevented = await new Promise((resolve) => {
            container.addEventListener('test', (event) => {
                resolve(event.defaultPrevented);
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

        expect(defaultPrevented).toBeFalse();
    });
});
