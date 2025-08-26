import { createElement } from 'lwc';
import Container from 'x/container';

/**
 * https://github.com/salesforce/lwc/issues/720
 */
describe('Issue 720: Wrap all string literal variables with toString method', () => {
    it('should not have have an error accessing state.foo', function () {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            const hasError = elm.shadowRoot.querySelector('.has-error');
            const noError = elm.shadowRoot.querySelector('.no-error');

            expect(hasError).toBeNull();
            expect(noError).not.toBeNull();
        });
    });
});
