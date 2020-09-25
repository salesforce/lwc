import { createElement } from 'lwc';
import Container from 'x/container';
import WithDynamic from 'x/withDynamic';
import WithEach from 'x/withEach';

describe('diffing algo', () => {
    it('should render slot default elements in correct order', function () {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        elm.triggerIssue();

        return Promise.resolve().then(() => {
            const content = elm.shadowRoot.textContent;
            // This first check is to verify that there is no extra text an any moment.
            expect(content).toBe('1235');
        });
    });

    it('should render template with foreach in correct order', function () {
        const elm = createElement('x-with-each', { is: WithEach });
        document.body.appendChild(elm);

        elm.triggerIssue();

        return Promise.resolve().then(() => {
            const content = elm.shadowRoot.textContent;
            // This first check is to verify that there is no extra text an any moment.
            expect(content).toBe('1235');
        });
    });

    it('should render template with dynamic component in correct order', function () {
        const elm = createElement('x-with-dynamic', { is: WithDynamic });
        document.body.appendChild(elm);

        elm.triggerIssue();

        return Promise.resolve().then(() => {
            const content = elm.shadowRoot.textContent;
            // This first check is to verify that there is no extra text an any moment.
            expect(content).toBe('1235');
        });
    });
});
