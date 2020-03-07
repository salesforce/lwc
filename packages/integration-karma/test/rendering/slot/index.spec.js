import { createElement } from 'lwc';
import Container from 'x/container';

describe('slot diffing algorithm', () => {
    it('should not re-render child component when parent component is re-rendered and api attributes does not change', function() {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        return Promise.resolve()
            .then(() => {
                const xChild = elm.shadowRoot.querySelector('x-child');

                expect(xChild.getRenderedTimes()).toBe(1);
                elm.reRenderElementInShadow();
                return Promise.resolve();
            })
            .then(() => {
                const xChild = elm.shadowRoot.querySelector('x-child');

                expect(xChild.getRenderedTimes()).toBe(1);
            });
    });

    it('should not re-render child component when slot change', function() {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        return Promise.resolve()
            .then(() => {
                elm.updateElementInDefaultSlot();
                elm.updateElementInNamedSlot();

                return Promise.resolve();
            })
            .then(() => {
                const xChild = elm.shadowRoot.querySelector('x-child');

                expect(xChild.getRenderedTimes()).toBe(1);

                expect(elm.shadowRoot.querySelector('p.default-slot').textContent).toBe('1');
                expect(elm.shadowRoot.querySelector('p.named-slot').textContent).toBe('1');
            });
    });

    it('should trigger slot change in child', function() {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        return Promise.resolve()
            .then(() => {
                elm.updateElementInDefaultSlot();
                elm.updateElementInNamedSlot();

                return Promise.resolve();
            })
            .then(() => {
                const xChild = elm.shadowRoot.querySelector('x-child');
                const { defaultCalledTimes, namedCalledTimes } = xChild.getSlotChangeEventCalls();

                expect(defaultCalledTimes).toBe(1);
                expect(namedCalledTimes).toBe(1);

                expect(elm.shadowRoot.querySelector('p.default-slot').textContent).toEqual('1');
                expect(elm.shadowRoot.querySelector('p.named-slot').textContent).toEqual('1');
                expect(xChild.getRenderedTimes()).toBe(1);
            });
    });
});
