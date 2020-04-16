import { createElement } from 'lwc';
import Container from 'x/container';

describe('Nested state', () => {
    it('Object keys should have the right value', function () {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            const nodeWithRenderedNestedState = elm.shadowRoot.querySelector('.key');

            expect(nodeWithRenderedNestedState).not.toBeNull();
            expect(nodeWithRenderedNestedState.textContent).toBe('yes');
        });
    });
});
