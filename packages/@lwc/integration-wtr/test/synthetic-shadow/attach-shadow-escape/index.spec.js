import { createElement } from 'lwc';
import Component from 'x/component';

// Capture the browser's native error message for duplicate attachShadow calls
// so the assertion works across all browsers.
const nativeAttachShadowErrorMessage = (() => {
    const el = document.createElement('div');
    el.attachShadow({ mode: 'open' });
    try {
        el.attachShadow({ mode: 'open' });
    } catch ({ message }) {
        return message;
    }
    return '';
})();

describe('attachShadow on synthetic shadow host', () => {
    it('should block calling this.template.host.attachShadow()', () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);
        expect(elm.error).toBeInstanceOf(Error);
        expect(elm.error.message).toBe(nativeAttachShadowErrorMessage);
        document.body.removeChild(elm);
    });
});
