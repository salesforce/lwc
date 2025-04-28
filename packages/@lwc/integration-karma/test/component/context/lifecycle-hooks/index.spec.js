import ContextParent from 'x/contextParent';
import { createElement } from 'lwc';

describe('connectedCallback', () => {
    fit('connects contextful fields when running connectedCallback', () => {
        const elm = createElement('x-context-parent', { is: ContextParent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-context-child');

        expect(child).toBeDefined();
        expect(child.shadowRoot.querySelector('p').textContent).toBe('Test Child: foo');
    });
});

describe('disconnectedCallback', () => {
    fit('removing child unsubscribes from context subscription during disconnect', async () => {
        const elm = createElement('x-context-parent', { is: ContextParent });
        document.body.appendChild(elm);
        const state = elm.state;

        expect(state.subscribers.size).toBe(1);
        elm.hideChild = true;
        await new Promise((resolve) => requestAnimationFrame(resolve));
        expect(state.subscribers.size).toBe(0);
    });
})