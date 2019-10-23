import { createElement } from 'lwc';
import Container from 'x/container';

describe('Moving elements from inside lwc:dom=manual', () => {
    it('should return correct parentNode', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);
        const span = document.createElement('span');
        const div = elm.shadowRoot.querySelector('div');
        div.appendChild(span);

        return Promise.resolve().then(() => {
            document.body.appendChild(span);

            // There is a drawback: The mutation observer is async, therefore if we access it immediately,
            // it will still have an owner key.
            return Promise.resolve().then(() => {
                expect(span.parentNode).toBe(document.body);
            });
        });
    });

    it('should return correct results in querySelector', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);
        const span = document.createElement('span');
        span.classList.add('qs-lwc-dom-manual');
        const div = elm.shadowRoot.querySelector('div');
        div.appendChild(span);

        return Promise.resolve().then(() => {
            document.body.appendChild(span);

            // There is a drawback: The mutation observer is async, therefore if we access it immediately,
            // it will still have an owner key.
            return Promise.resolve().then(() => {
                expect(document.querySelector('.qs-lwc-dom-manual')).toBe(span);
            });
        });
    });

    it('should return correct results in querySelectorAll', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);
        const span = document.createElement('span');
        span.classList.add('qs-all-lwc-dom-manual');
        const div = elm.shadowRoot.querySelector('div');
        div.appendChild(span);

        return Promise.resolve().then(() => {
            document.body.appendChild(span);

            // There is a drawback: The mutation observer is async, therefore if we access it immediately,
            // it will still have an owner key.
            return Promise.resolve().then(() => {
                expect(document.querySelectorAll('.qs-all-lwc-dom-manual')[0]).toBe(span);
            });
        });
    });

    it('should return correct results in querySelector when node is added/removed on the same tick', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);
        const span = document.createElement('span');
        span.classList.add('qs-mm-lwc-dom-manual');
        const div = elm.shadowRoot.querySelector('div');
        div.appendChild(span);
        div.removeChild(span);

        return Promise.resolve().then(() => {
            document.body.appendChild(span);

            // There is a drawback: The mutation observer is async, therefore if we access it immediately,
            // it will still have an owner key.
            return Promise.resolve().then(() => {
                expect(document.querySelector('.qs-mm-lwc-dom-manual')).toBe(span);
            });
        });
    });
});
