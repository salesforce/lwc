import { createElement } from 'lwc';
import Shadow from 'x/shadow';

describe('in shadow dom', () => {
    it('appending to host should not throw error', () => {
        let element;
        expect(() => {
            element = createElement('x-container', { is: Shadow });
            document.body.appendChild(element);
        }).not.toThrowError();
        if (process.env.NATIVE_SHADOW) {
            // synthetic shadow returns null here even though it successfully inserts the div
            expect(element.firstChild.tagName).toEqual('DIV');
        }
    });
});
