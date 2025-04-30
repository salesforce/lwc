import Root from 'x/root';
import { createElement } from 'lwc';

describe('connectedCallback', () => {
    fit('connects contextful fields when running connectedCallback', () => {
        const providedValue = 'parent provided value';
        const root = createElement('x-root', { is: Root });
        document.body.appendChild(root);

        const parent = root.shadowRoot.querySelector('x-parent');
        const detachedGrandchild = root.shadowRoot.querySelector('x-grandchild');    
        const children = Array.from(parent.shadowRoot.querySelectorAll('x-child'));
        const grandchildren = children.map(child => child.shadowRoot.querySelector('x-grandchild'));
        //const child = elm.shadowRoot.querySelector('x-child');
        debugger;

        expect(parent.context.value).toBe(providedValue);
        expect(detachedGrandchild.context.value).toBeUndefined();
        children.forEach(child => expect(child.context.value).toBe(providedValue));
        grandchildren.forEach(grandchild => expect(grandchild.context.value).toBe(providedValue));
    });
});

/*
describe('disconnectedCallback', () => {
    it('removing child unsubscribes from context subscription during disconnect', async () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        const state = elm.state;

        expect(state.subscribers.size).toBe(1);
        elm.hideChild = true;
        await new Promise((resolve) => requestAnimationFrame(resolve));
        expect(state.subscribers.size).toBe(0);
    });
})*/