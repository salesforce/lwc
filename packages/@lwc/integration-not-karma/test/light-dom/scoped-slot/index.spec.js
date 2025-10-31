import { createElement } from 'lwc';

import BasicParent from 'c/basicParent';
import ParentOfChildWithForEach from 'c/parentOfChildWithForEach';
import ParentWNoSlotContent from 'c/parentWNoSlotContent';
import ParentOfChildWithNamedSlots from 'c/parentOfChildWithNamedSlots';
import NestedSlots from 'c/nestedSlots';
import {
    USE_LIGHT_DOM_SLOT_FORWARDING,
    USE_COMMENTS_FOR_FRAGMENT_BOOKENDS,
} from '../../../helpers/constants.js';

const vFragBookend = USE_COMMENTS_FOR_FRAGMENT_BOOKENDS ? '<!---->' : '';

describe('scoped slots', () => {
    it('scoped slots work with default slots', () => {
        const elm = createElement('c-component', { is: BasicParent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('c-basic-child');
        expect(child.querySelector('span').innerHTML).toBe('1234 - Test');
        expect(elm.shadowRoot.querySelector('span').innerHTML).toBe('1234 - Test');
    });

    it('works with for:each iterator', () => {
        const elm = createElement('c-component', { is: ParentOfChildWithForEach });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('c-child-with-for-each');
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
        const elm = createElement('c-component', { is: ParentWNoSlotContent });
        document.body.appendChild(elm);

        const child = elm.shadowRoot.querySelector('c-child-w-default-content');
        expect(child.querySelector('span').innerHTML).toBe('default - Fallback Content');
    });

    it('scoped slots work with named slots', () => {
        const elm = createElement('c-component', { is: ParentOfChildWithNamedSlots });
        document.body.appendChild(elm);

        const child = elm.shadowRoot.querySelector('c-child-with-named-slots');
        // Verify scoped slots
        expect(child.querySelector('.slotname1').innerHTML).toBe(
            `${vFragBookend}${vFragBookend}<p>2021 World Series</p>${vFragBookend}${vFragBookend}`
        );
        expect(child.querySelector('.slotname2').innerHTML).toBe(
            `${vFragBookend}${vFragBookend}<p>Houston Astros</p>${vFragBookend}${vFragBookend}`
        );
        expect(child.querySelector('.defaultslot').innerHTML).toBe(
            `${vFragBookend}${vFragBookend}<p>Atlanta Braves</p>${vFragBookend}${vFragBookend}`
        );
        // verify standard slot type
        // For standard slot content, "slot" attribute goes directly on the element unlike scoped
        //  slots where the attribute goes on the template tag
        expect(child.querySelector('.slotname3').innerHTML).toBe(
            USE_LIGHT_DOM_SLOT_FORWARDING
                ? `${vFragBookend}<p>MLB</p>${vFragBookend}`
                : `${vFragBookend}<p slot="slotname3">MLB</p>${vFragBookend}`
        );
    });

    it('scoped slot content can be nested inside another', () => {
        const elm = createElement('c-nested', { is: NestedSlots });
        document.body.appendChild(elm);

        const rows = elm.shadowRoot.querySelectorAll('c-row');
        expect(rows.length).toBe(4);
        expect(elm.shadowRoot.querySelectorAll('span.cell').length).toBe(7);
        // spot check one row
        expect(rows[2].textContent).toBe('Cell: 3 - 1Cell: 3 - 2Cell: 3 - 3');
    });
});
