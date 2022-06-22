import { createElement } from 'lwc';
import Container from 'x/container';

// x-child show/hides the slotted content
// Note: There is a difference between native and synthetic shadow on how they handle slotted content:
// In native shadow: The slot content will be present and connected, but when not visible, assignedSlot=false.
// In the synthetic shadow however, slot content will be not be present in the DOM when not rendered.

describe('custom elements', () => {
    it('should not be reused when slotted', function () {
        const elm = createElement('x-container', { is: Container });
        elm.isCustomElement = true;
        document.body.appendChild(elm);

        const child = elm.shadowRoot.querySelector('x-child');
        let firstRenderCustomElement;

        return Promise.resolve()
            .then(() => (child.open = true))
            .then(() => {
                firstRenderCustomElement = elm.shadowRoot.querySelector('x-simple');
                child.open = false;
            })
            .then(() => (child.open = true))
            .then(() => {
                const xSimple = elm.shadowRoot.querySelector('x-simple');

                expect(xSimple).not.toBeNull();
                expect(xSimple.assignedSlot).not.toBeNull();
                expect(elm.shadowRoot.querySelector('.mark')).not.toBeNull();

                if (!process.env.NATIVE_SHADOW) {
                    expect(xSimple).not.toBe(firstRenderCustomElement);
                }
            });
    });
});

describe('elements', () => {
    if (!process.env.NATIVE_SHADOW) {
        it('should not be reused when slotted', function () {
            const elm = createElement('x-container', { is: Container });
            elm.isElement = true;
            document.body.appendChild(elm);

            const child = elm.shadowRoot.querySelector('x-child');
            let firstRenderElement;

            return Promise.resolve()
                .then(() => (child.open = true))
                .then(() => {
                    firstRenderElement = elm.shadowRoot.querySelector('button');
                    child.open = false;
                })
                .then(() => (child.open = true))
                .then(() => {
                    const btnElement = elm.shadowRoot.querySelector('button');

                    expect(btnElement).not.toBeNull();
                    expect(btnElement.assignedSlot).not.toBeNull();
                    expect(btnElement).not.toBe(firstRenderElement);
                });
        });
    }

    it('should not add listener multiple times', function () {
        const elm = createElement('x-container', { is: Container });
        elm.isElement = true;
        document.body.appendChild(elm);
        let listenerCalledTimes;
        elm.addEventListener('handlercalled', () => listenerCalledTimes++);

        const child = elm.shadowRoot.querySelector('x-child');

        return Promise.resolve()
            .then(() => (child.open = true))
            .then(() => {
                const btnElement = elm.shadowRoot.querySelector('button');

                listenerCalledTimes = 0;
                btnElement.click();
                expect(listenerCalledTimes).toBe(1);

                child.open = false;
            })
            .then(() => (child.open = true))
            .then(() => {
                const btnElement = elm.shadowRoot.querySelector('button');

                listenerCalledTimes = 0;
                btnElement.click();
                expect(listenerCalledTimes).toBe(1);
            });
    });
});

if (process.env.NATIVE_SHADOW) {
    it('should render same styles for custom element instances', function () {
        const elm = createElement('x-container', { is: Container });
        elm.isStyleCheck = true;
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            const styles = Array.from(elm.shadowRoot.querySelectorAll('x-simple')).map(
                (xSimple) => {
                    // If constructable stylesheets are supported, return that rather than <style> tags
                    // In Chrome 99+, adoptedStyleSheets is a proxy, so we have to clone it to compare
                    return xSimple.shadowRoot.adoptedStyleSheets
                        ? [...xSimple.shadowRoot.adoptedStyleSheets]
                        : xSimple.shadowRoot.querySelector('style');
                }
            );

            expect(styles[0]).toBeTruthy();
            expect(styles[0]).toEqual(styles[1]);
            expect(styles[1]).toEqual(styles[2]);
        });
    });
}
