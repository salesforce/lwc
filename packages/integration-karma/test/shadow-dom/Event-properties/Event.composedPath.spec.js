import { createElement } from 'lwc';

import Container from 'x/container';

describe('Event.composedPath', () => {
    it('should return an empty array when asynchronously invoked', function (done) {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        container.addEventListener('test', (event) => {
            expect(event.composedPath()).toHaveSize(7);
            setTimeout(() => {
                expect(event.composedPath()).toHaveSize(0);
                done();
            });
        });
        const div = container.shadowRoot.querySelector('div');
        div.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
    });

    it('should not throw when invoked on an event with a target that is not an instance of Node', function (done) {
        const req = new XMLHttpRequest();
        req.addEventListener('readystatechange', (event) => {
            // Chrome and Safari return an empty array but Firefox returns an array containing a
            // single instance of XMLHttpRequest.
            expect(() => {
                event.composedPath();
            }).not.toThrowError();
            done();
        });
        req.open('GET', 'http://localhost');
        req.send();
    });
});
