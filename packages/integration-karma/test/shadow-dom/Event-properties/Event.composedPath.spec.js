import { createElement } from 'lwc';

import Container from 'x/container';

describe('Event.composedPath', () => {
    it('should return an empty array when asynchronously invoked', () => {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        let _event;
        container.addEventListener('test', (event) => {
            _event = event;
        });

        const div = container.shadowRoot.querySelector('div');
        div.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));

        expect(_event.composedPath()).toHaveSize(0);
    });

    it('should not throw when invoked on an event with a target that is not an instance of Node', (done) => {
        const req = new XMLHttpRequest();
        req.addEventListener('test', (event) => {
            // Not looking at return value because browsers have different implementations.
            expect(() => {
                event.composedPath();
            }).not.toThrowError();
            done();
        });
        req.dispatchEvent(new CustomEvent('test'));
    });
});
