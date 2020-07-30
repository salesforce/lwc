import { createElement } from 'lwc';
import Container from 'x/container';

describe('Window-bound Event relatedTarget', () => {
    it('should trigger event without throwing an error', function () {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        window.dispatchEvent(new Event('mouseout'));

        return Promise.resolve().then(() => {
            expect(elm.testStatus).toBe('OK');
            expect(elm.testMessage).toBeUndefined();
        });
    });
});
