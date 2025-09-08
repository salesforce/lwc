import { createElement } from 'lwc';

import Container from 'x/container';

describe('Event.currentTarget', () => {
    it('should be null when accessed asynchronously', async () => {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        const [first, second] = await new Promise((resolve) => {
            container.addEventListener('test', (event) => {
                const first = event.currentTarget;
                setTimeout(() => {
                    const second = event.currentTarget;
                    resolve([first, second]);
                });
            });
            const div = container.shadowRoot.querySelector('div');
            div.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
        });

        expect(first).toBe(container);
        expect(second).toBeNull();
    });

    it('should reference the host element', async () => {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        const currentTarget = await new Promise((resolve) => {
            container.addEventListener('test', (event) => {
                resolve(event.currentTarget);
            });

            const child = container.shadowRoot.querySelector('x-child');
            child.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
        });

        expect(currentTarget).toBe(container);
    });

    it('should reference the shadow root', async () => {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        const currentTarget = await new Promise((resolve) => {
            container.shadowRoot.addEventListener('test', (event) => {
                resolve(event.currentTarget);
            });

            const child = container.shadowRoot.querySelector('x-child');
            child.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
        });

        expect(currentTarget).toBe(container.shadowRoot);
    });
});
