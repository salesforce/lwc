import { createElement } from 'lwc';
import Container from 'x/container';

describe('Form tag rendering', () => {
    it('should have the right value', function () {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            const nodeWithTextInsideForm = elm.shadowRoot.querySelector('.form-text');

            expect(nodeWithTextInsideForm).not.toBeNull();
            expect(nodeWithTextInsideForm.textContent).toBe('Form did render');
        });
    });
});
