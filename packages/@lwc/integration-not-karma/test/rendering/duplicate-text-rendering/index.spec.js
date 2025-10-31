import { createElement } from 'lwc';
import Container from 'c/container';

describe('Dynamic text nodes rendering duplicate text', () => {
    it('should not render duplicate text', async () => {
        const elm = createElement('c-container', { is: Container });
        document.body.appendChild(elm);

        elm.click();

        await Promise.resolve();
        const textInFirstCheck = elm.shadowRoot.textContent;
        // This first check is to verify that there is no extra text an any moment.
        expect(textInFirstCheck).not.toBe('ab');
        await Promise.resolve();
        const textInFirstCheck_1 = elm.shadowRoot.textContent;
        expect(textInFirstCheck_1).toBe('b');
    });
});
