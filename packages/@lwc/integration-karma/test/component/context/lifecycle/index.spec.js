import Root from 'x/root';
import TooMuchContext from 'x/tooMuchContext';
import { createElement } from 'lwc';

function createComponents() {
    const root = createElement('x-root', { is: Root });

    document.body.appendChild(root);

    const parent = root.shadowRoot.querySelector('x-parent');
    const detachedGrandchild = root.shadowRoot.querySelector('x-grandchild');
    const children = Array.from(parent.shadowRoot.querySelectorAll('x-child'));
    const grandchildren = children.map((child) => child.shadowRoot.querySelector('x-grandchild'));

    return {
        root,
        parent,
        detachedGrandchild,
        children,
        grandchildren,
    };
}

describe('connectedCallback', () => {
    it('connects contextful fields when running connectedCallback', () => {
        const providedValue = 'parent provided value';
        const { parent, children, grandchildren, detachedGrandchild } = createComponents();

        expect(parent.context.value).toBe(providedValue);
        children.forEach((child) => expect(child.context.value).toBe(providedValue));
        grandchildren.forEach((grandchild) => expect(grandchild.context.value).toBe(providedValue));

        expect(detachedGrandchild.context.value).toBeUndefined();
    });

    it('generates an error when context is provided more than once for the same variety', () => {
        const consoleSpy = TestUtils.spyConsole();
        document.body.appendChild(createElement('x-too-much-context', { is: TooMuchContext }));

        expect(consoleSpy.calls.error[0][0].message).toContain(
            'Multiple contexts of the same variety were provided. Only the first context will be used.'
        );
    });
});

describe('disconnectedCallback', () => {
    it('removing child unsubscribes from context subscription during disconnect', async () => {
        const { root, parent, children, grandchildren, detachedGrandchild } = createComponents();

        parent.disconnect = () => expect(parent.context.disconnectContextCalled).toBeTrue();
        children.forEach(
            (child) =>
                (child.disconnect = () => expect(child.context.disconnectContextCalled).toBeTrue())
        );
        grandchildren.forEach(
            (grandchild) =>
                (grandchild.disconnect = () =>
                    expect(grandchild.context.disconnectContextCalled).toBeTrue())
        );
        detachedGrandchild.disconnect = () =>
            expect(parent.context.disconnectContextCalled).toBeFalse();

        document.body.removeChild(root);
    });
});
