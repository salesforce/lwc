import { createElement } from 'lwc';

import BasicParent from 'x/basicParent';
import ParentOfChildWithForEach from 'x/parentOfChildWithForEach';
import ParentWNoSlotContent from 'x/parentWNoSlotContent';

describe('scoped slots', () => {
    it('scoped slots work with default slots', () => {
        const elm = createElement('x-component', { is: BasicParent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-basic-child');
        expect(child.querySelector('span').innerHTML).toBe('1234 - Test');
        expect(elm.shadowRoot.querySelector('span').innerHTML).toBe('1234 - Test');
    });

    it('works with for:each iterator', () => {
        const elm = createElement('x-component', { is: ParentOfChildWithForEach });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-child-with-for-each');
        const spans = elm.shadowRoot.querySelectorAll('span');
        // Verify that parent's slot content was created multiple times
        expect(spans.length).toBe(2);
        expect(spans[0].innerHTML).toBe('39 - Audio');
        expect(spans[1].innerHTML).toBe('40 - Video');
        // Verify that styles from parent applied to child
        expect(window.getComputedStyle(spans[0]).backgroundColor).toBe('rgb(0, 0, 255)');
        // Verify that content from child's light dom is same as slotted content from parent
        const spansFromLightDOM = child.querySelectorAll('span');
        expect(spansFromLightDOM[0]).toBe(spans[0]);
        expect(spansFromLightDOM[1]).toBe(spans[1]);
    });

    it('fallback to default content when no slot content provided by parent', () => {
        const elm = createElement('x-component', { is: ParentWNoSlotContent });
        document.body.appendChild(elm);

        const child = elm.shadowRoot.querySelector('x-child-w-default-content');
        expect(child.querySelector('span').innerHTML).toBe('default - Fallback Content');
    });
});
