import { createElement } from 'lwc';
import Shadow from 'x/shadow';

describe('host element', () => {
    it('should accept children being appended to it', () => {
        const element = createElement('x-container', { is: Shadow });
        document.body.appendChild(element);
        if (process.env.NATIVE_SHADOW) {
            // synthetic shadow returns null here even though it successfully inserts the div
            expect(element.firstChild.tagName).toEqual('DIV');
        }
    });
});
