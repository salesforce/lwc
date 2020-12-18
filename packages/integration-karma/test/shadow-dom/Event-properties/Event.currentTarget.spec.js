import { createElement } from 'lwc';

import Container from 'x/container';

it('should be null when accessed asynchronously', function (done) {
    const container = createElement('x-container', { is: Container });
    document.body.appendChild(container);

    container.addEventListener('test', (event) => {
        expect(event.currentTarget).toEqual(container);
        setTimeout(() => {
            expect(event.currentTarget).toBeNull();
            done();
        });
    });
    const div = container.shadowRoot.querySelector('div');
    div.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
});
