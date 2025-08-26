import { createElement } from 'lwc';
import Container from 'x/container';

describe('Dynamic text nodes rendering duplicate text', () => {
    it('should not render duplicate text', function () {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        elm.click();

        return Promise.resolve().then(() => {
            const textInFirstCheck = elm.shadowRoot.textContent;
            // This first check is to verify that there is no extra text an any moment.
            expect(textInFirstCheck).not.toBe('ab');

            return Promise.resolve().then(() => {
                const textInFirstCheck = elm.shadowRoot.textContent;
                expect(textInFirstCheck).toBe('b');
            });
        });
    });
});
