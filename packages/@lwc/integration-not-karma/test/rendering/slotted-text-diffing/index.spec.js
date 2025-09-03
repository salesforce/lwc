import { createElement } from 'lwc';
import Container from 'x/container';

describe('Dynamic diffing algo for slotted text', () => {
    it('should not confuse text vnodes when moving elements', function () {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.textContent).toBe('first textDisplay Boolean Value: truesecond text');
        elm.toggleVisibility();

        return Promise.resolve()
            .then(() => {
                const text = elm.shadowRoot.textContent;
                expect(text).toBe('Display Boolean Value: false');

                elm.toggleVisibility();
            })
            .then(() => {
                const text = elm.shadowRoot.textContent;
                expect(text).toBe('first textDisplay Boolean Value: truesecond text');
            });
    });
});
