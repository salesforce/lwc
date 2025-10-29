import { createElement } from 'lwc';
import Container from 'c/container';

// synthetic shadow can't do this kind of style encapsulation
describe.runIf(process.env.NATIVE_SHADOW)('Light DOM styling with :host', () => {
    it(':host can style a containing shadow component', () => {
        const elm = createElement('c-container', { is: Container });
        document.body.appendChild(elm);

        expect(elm.shadowRoot).not.toBeNull();

        expect(getComputedStyle(elm).backgroundColor).toEqual('rgb(139, 69, 19)');
    });
});
