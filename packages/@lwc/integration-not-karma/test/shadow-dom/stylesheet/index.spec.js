import { createElement } from 'lwc';

import Parent from 'c/parent';
import Host from 'c/host';
import MultiTemplates from 'c/multiTemplates';
import { resetDOM } from '../../../helpers/reset';

afterEach(resetDOM);

describe('shadow encapsulation', () => {
    it('should not style children elements', () => {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentDiv = elm.shadowRoot.querySelector('div');
        expect(window.getComputedStyle(parentDiv).marginLeft).toBe('10px');
        const childDiv = elm.shadowRoot.querySelector('c-child').shadowRoot.querySelector('div');
        expect(window.getComputedStyle(childDiv).marginLeft).toBe('0px');
    });

    it('should work with multiple templates', async () => {
        const elm = createElement('c-multi-template', { is: MultiTemplates });
        document.body.appendChild(elm);

        const div = elm.shadowRoot.querySelector('div');
        expect(window.getComputedStyle(div).marginLeft).toBe('10px');
        expect(window.getComputedStyle(div).marginRight).toBe('0px');

        elm.toggleTemplate();
        await Promise.resolve();
        const div_1 = elm.shadowRoot.querySelector('div');
        expect(window.getComputedStyle(div_1).marginLeft).toBe('0px');
        expect(window.getComputedStyle(div_1).marginRight).toBe('10px');
    });
});

describe(':host', () => {
    it('should apply style to the host element', () => {
        const elm = createElement('c-host', { is: Host });
        document.body.appendChild(elm);

        expect(window.getComputedStyle(elm).marginLeft).toBe('10px');
    });

    it('should apply style to the host element with the matching attributes', () => {
        const elm = createElement('c-host', { is: Host });
        elm.setAttribute('data-styled', true);
        document.body.appendChild(elm);

        expect(window.getComputedStyle(elm).marginLeft).toBe('20px');
    });
});
