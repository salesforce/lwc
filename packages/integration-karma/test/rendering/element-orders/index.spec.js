import { createElement } from 'lwc';
import Container from 'x/container';

describe('diffing algo', () => {
    it('should render elements in correct order', function () {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        elm.triggerIssue();

        return Promise.resolve().then(() => {
            const content = elm.shadowRoot.textContent;
            // This first check is to verify that there is no extra text an any moment.
            expect(content).toBe("1235");
        });
    });
});
