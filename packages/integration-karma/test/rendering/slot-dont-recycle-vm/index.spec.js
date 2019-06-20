import { createElement } from 'lwc';
import Container from 'x/container';

describe('Component', () => {
    it('should not have have an error accessing state.foo', function() {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            const child = elm.shadowRoot.querySelector('x-child');
            child.open();

            return Promise.resolve().then(() => {
                expect(child.querySelector('x-simple').shadowRoot.querySelector('p')).toBeDefined();
                child.close();

                return Promise.resolve().then(() => {
                    expect(child.querySelector('x-simple')).toBeNull();
                    child.open();

                    return Promise.resolve().then(() => {
                        expect(
                            child.querySelector('x-simple').shadowRoot.querySelector('p')
                        ).toBeDefined();
                    });
                });
            });
        });
    });
});
