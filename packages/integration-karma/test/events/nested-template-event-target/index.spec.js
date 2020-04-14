import { createElement } from 'lwc';
import Container from 'x/container';

describe('Event target in slot elements', () => {
    it('should receive event with correct target', function () {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        const child = elm.shadowRoot.querySelector('x-child');

        child.dispatchFoo();

        return Promise.resolve().then(() => {
            const elementWithResult = elm.shadowRoot.querySelector('.evt-target-is-x-child');
            expect(elementWithResult).not.toBeNull();
            expect(elementWithResult.innerText).toBe('Event Target Is x-child');
        });
    });
});
