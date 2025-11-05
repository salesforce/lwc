import { createElement } from 'lwc';
import Component from 'x/component';

describe('attribute with namespace', () => {
    it('correctly renders xml:* and xlink:* attributes', async () => {
        const elm = createElement('x-component', { is: Component });
        elm.title = 'foo';
        elm.lang = 'en-US';
        document.body.appendChild(elm);
        await Promise.resolve();

        // svg namespace
        expect(elm.shadowRoot.querySelector('image').getAttribute('xlink:title')).toBe('foo');
        // xml namespace
        expect(elm.shadowRoot.querySelector('label').getAttribute('xml:lang')).toBe('en-US');
    });
});
