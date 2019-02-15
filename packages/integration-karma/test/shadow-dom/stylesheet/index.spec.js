import { createElement } from 'test-utils';

import Parent from 'x/parent';
import Host from 'x/host';
import MultiTemplates from 'x/multiTemplates';

describe('shadow encapsulation', () => {
    it('should not style children elements', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentDiv = elm.shadowRoot.querySelector('div');
        expect(window.getComputedStyle(parentDiv).backgroundColor).toBe('rgb(0, 255, 0)');
        const childDiv = elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div');
        expect(window.getComputedStyle(childDiv).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    });

    it('should work with multiple templates', () => {
        const elm = createElement('x-multi-template', { is: MultiTemplates });
        document.body.appendChild(elm);

        const div = elm.shadowRoot.querySelector('div');
        expect(window.getComputedStyle(div).backgroundColor).toBe('rgb(255, 0, 0)');

        elm.toggleTemplate();
        return Promise.resolve().then(() => {
            const div = elm.shadowRoot.querySelector('div');
            expect(window.getComputedStyle(div).backgroundColor).toBe('rgb(0, 255, 0)');
        });
    })
});

describe(':host', () => {
    it('should apply style to the host element', () => {
        const elm = createElement('x-host', { is: Host });
        document.body.appendChild(elm);

        expect(window.getComputedStyle(elm).backgroundColor).toBe('rgb(255, 0, 0)');
    });

    it('should apply style to the host element with the matching attributes', () => {
        const elm = createElement('x-host', { is: Host });
        elm.setAttribute('data-styled', true);
        document.body.appendChild(elm);

        expect(window.getComputedStyle(elm).backgroundColor).toBe('rgb(0, 0, 255)');
    });
});
