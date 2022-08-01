import { createElement } from 'lwc';

import Parent from 'x/parent';
import Host from 'x/host';
import MultiTemplates from 'x/multiTemplates';

describe('shadow encapsulation', () => {
    it('should not style children elements', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentDiv = elm.shadowRoot.querySelector('div');
        expect(window.getComputedStyle(parentDiv).marginLeft).toBe('10px');
        const childDiv = elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div');
        expect(window.getComputedStyle(childDiv).marginLeft).toBe('0px');
    });

    it('should work with multiple templates', () => {
        const elm = createElement('x-multi-template', { is: MultiTemplates });
        document.body.appendChild(elm);

        const div = elm.shadowRoot.querySelector('div');
        expect(window.getComputedStyle(div).marginLeft).toBe('10px');
        expect(window.getComputedStyle(div).marginRight).toBe('0px');

        elm.toggleTemplate();
        return Promise.resolve().then(() => {
            const div = elm.shadowRoot.querySelector('div');
            expect(window.getComputedStyle(div).marginLeft).toBe('0px');
            expect(window.getComputedStyle(div).marginRight).toBe('10px');
        });
    });
});

describe(':host', () => {
    it('should apply style to the host element', () => {
        const elm = createElement('x-host', { is: Host });
        document.body.appendChild(elm);

        expect(window.getComputedStyle(elm).marginLeft).toBe('10px');
    });

    it('should apply style to the host element with the matching attributes', () => {
        const elm = createElement('x-host', { is: Host });
        elm.setAttribute('data-styled', true);
        document.body.appendChild(elm);

        expect(window.getComputedStyle(elm).marginLeft).toBe('20px');
    });
});
