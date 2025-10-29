import { createElement } from 'lwc';
import Container from 'c/container';

describe('Dynamic diffing algo for slotted text', () => {
    it('should not confuse text vnodes when moving elements', async () => {
        const elm = createElement('c-container', { is: Container });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.textContent).toBe('first textDisplay Boolean Value: truesecond text');
        elm.toggleVisibility();

        await Promise.resolve();
        const text = elm.shadowRoot.textContent;
        expect(text).toBe('Display Boolean Value: false');
        elm.toggleVisibility();
        await Promise.resolve();
        const text_1 = elm.shadowRoot.textContent;
        expect(text_1).toBe('first textDisplay Boolean Value: truesecond text');
    });
});
