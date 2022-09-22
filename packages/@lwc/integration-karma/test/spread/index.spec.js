import { createElement } from 'lwc';
import Test from 'x/test';

describe('lwc:spread', () => {
    let elm, simpleChild, overriddenChild;
    beforeEach(() => {
        elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        simpleChild = elm.shadowRoot.querySelector('.x-child-simple');
        overriddenChild = elm.shadowRoot.querySelector('.x-child-overridden');
        spyOn(console, 'log');
    });
    it('should render basic test', () => {
        expect(simpleChild.shadowRoot.querySelector('span').textContent).toEqual('Name: LWC');
    });
    it('should assign onclick', () => {
        simpleChild.click();
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith('spread click called', simpleChild);
    });
    it('should override values in template', () => {
        expect(overriddenChild.shadowRoot.querySelector('span').textContent).toEqual('Name: Aura');
    });
    it('should assign onclick along with the one in template', () => {
        overriddenChild.click();
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith('spread click called', overriddenChild);
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith(
            'template click called',
            jasmine.any(Object) /* component */
        );
    });

    it('should assign props to standard elements', () => {
        expect(elm.shadowRoot.querySelector('span').className).toEqual('spanclass');
    });
});
