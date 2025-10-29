import { createElement } from 'lwc';

import BasicSlot from 'c/basicSlot';
import DynamicChildren from 'c/dynamicChildren';
import LightConsumer from 'c/lightConsumer';
import ShadowConsumer from 'c/shadowConsumer';
import ConditionalSlot from 'c/conditionalSlot';
import ConditionalSlotted from 'c/conditionalSlotted';
import ForwardedSlotConsumer from 'c/forwardedSlotConsumer';
import {
    USE_COMMENTS_FOR_FRAGMENT_BOOKENDS,
    USE_LIGHT_DOM_SLOT_FORWARDING,
    USE_FRAGMENTS_FOR_LIGHT_DOM_SLOTS,
} from '../../../helpers/constants.js';
import { extractDataIds } from '../../../helpers/utils.js';

const vFragBookend = USE_COMMENTS_FOR_FRAGMENT_BOOKENDS ? '<!---->' : '';

function createTestElement(tag, component) {
    const elm = createElement(tag, { is: component });
    elm.setAttribute('data-id', tag);
    document.body.appendChild(elm);
    return extractDataIds(elm);
}

describe('Slotting', () => {
    it('should render properly', () => {
        const nodes = createTestElement('c-default-slot', BasicSlot);

        expect(Array.from(nodes['c-container'].children)).toEqual([
            nodes['upper-text'],
            nodes['default-text'],
            nodes['lower-text'],
        ]);
    });

    it('should render dynamic children', async () => {
        const nodes = createTestElement('c-dynamic-children', DynamicChildren);
        expect(Array.from(nodes['c-light-container'].children)).toEqual([
            nodes['container-upper-slot-default'],
            nodes['1'],
            nodes['2'],
            nodes['3'],
            nodes['4'],
            nodes['5'],
            nodes['container-lower-slot-default'],
        ]);

        nodes.button.click();
        await Promise.resolve();

        expect(Array.from(nodes['c-light-container'].children)).toEqual([
            nodes['container-upper-slot-default'],
            nodes['5'],
            nodes['4'],
            nodes['3'],
            nodes['2'],
            nodes['1'],
            nodes['container-lower-slot-default'],
        ]);
    });

    it('should return null for assignedSlot of default slotted content', () => {
        const nodes = createTestElement('c-dynamic-children', DynamicChildren);

        expect(nodes['container-upper-slot-default'].assignedSlot).toBeNull();
        expect(nodes['container-lower-slot-default'].assignedSlot).toBeNull();
    });

    it('shadow container, light consumer', () => {
        const nodes = createTestElement('c-light-consumer', LightConsumer);

        const expected = process.env.NATIVE_SHADOW // native shadow doesn't output slots in innerHTML
            ? '<c-shadow-container><p data-id="light-consumer-text">Hello from Light DOM</p></c-shadow-container>'
            : '<c-shadow-container><slot><p data-id="light-consumer-text">Hello from Light DOM</p></slot></c-shadow-container>';
        expect(nodes['c-light-consumer'].innerHTML).toEqual(expected);
    });

    it('light container, shadow consumer', () => {
        const nodes = createTestElement('c-shadow-consumer', ShadowConsumer);

        expect(nodes['c-shadow-consumer'].shadowRoot.innerHTML).toEqual(
            `<c-light-container>${vFragBookend}<p data-id="container-upper-slot-default">Upper slot default</p>${vFragBookend}${vFragBookend}<p data-id="shadow-consumer-text">Hello from Shadow DOM</p>${vFragBookend}${vFragBookend}<p data-id="container-lower-slot-default">Lower slot default</p>${vFragBookend}</c-light-container>`
        );
    });

    it('removes slots properly', async () => {
        const nodes = createTestElement('c-conditional-slot', ConditionalSlot);
        const elm = nodes['c-conditional-slot'];
        expect(Array.from(elm.children)).toEqual([nodes['default-slotted-text'], nodes.button]);
        nodes.button.click();
        await Promise.resolve();
        expect(Array.from(elm.children)).toEqual([nodes.button]);
    });

    it('removes slotted content properly', async () => {
        const nodes = createTestElement('c-conditional-slotted', ConditionalSlotted);
        const elm = nodes['c-conditional-slotted'];
        expect(elm.innerHTML).toEqual(
            `<c-conditional-slot data-id="conditional-slot">${vFragBookend}<p data-id="slotted-text">Slotted content</p>${vFragBookend}<button data-id="button">Toggle</button></c-conditional-slot>`
        );
        nodes.button.click();
        await Promise.resolve();
        expect(elm.innerHTML).toEqual(
            '<c-conditional-slot data-id="conditional-slot"><button data-id="button">Toggle</button></c-conditional-slot>'
        );
    });

    it('should forward slots', () => {
        const nodes = createTestElement('c-forwarded-slot-consumer', ForwardedSlotConsumer);
        const elm = nodes['c-forwarded-slot-consumer'];
        expect(elm.innerHTML).toEqual(
            USE_LIGHT_DOM_SLOT_FORWARDING
                ? `<c-forwarded-slot><c-light-container>${vFragBookend}<p>Upper slot content forwarded</p>${vFragBookend}${vFragBookend}<p>Default slot forwarded</p>${vFragBookend}${vFragBookend}<p>Lower slot content forwarded</p>${vFragBookend}</c-light-container></c-forwarded-slot>`
                : `<c-forwarded-slot><c-light-container>${vFragBookend}<p slot="upper">Upper slot content forwarded</p>${vFragBookend}${vFragBookend}<p>Default slot forwarded</p>${vFragBookend}${vFragBookend}<p slot="lower">Lower slot content forwarded</p>${vFragBookend}</c-light-container></c-forwarded-slot>`
        );
    });
    it('should render default content in forwarded slots', async () => {
        const nodes = createTestElement('c-forwarded-slot-consumer', ForwardedSlotConsumer);
        const elm = nodes['c-forwarded-slot-consumer'];
        elm.shouldSlot(false);

        await Promise.resolve();
        expect(elm.innerHTML).toEqual(
            `<c-forwarded-slot><c-light-container>${vFragBookend}<p data-id="container-upper-slot-default">Upper slot default</p>${vFragBookend}${vFragBookend}Default slot not yet forwarded${vFragBookend}${vFragBookend}<p data-id="container-lower-slot-default">Lower slot default</p>${vFragBookend}</c-light-container></c-forwarded-slot>`
        );
    });

    it('should only generate empty text nodes for APIVersion >=60', async () => {
        const elm = createElement('c-default-slot', { is: BasicSlot });
        document.body.appendChild(elm);
        await Promise.resolve();
        const container = elm.querySelector('c-light-container');
        const commentNodes = [...container.childNodes].filter(
            (_) => _.nodeType === Node.COMMENT_NODE
        );
        if (USE_FRAGMENTS_FOR_LIGHT_DOM_SLOTS) {
            expect(commentNodes.length).toBe(6); // 3 slots, so 3*2=6 comment nodes
        } else {
            expect(commentNodes.length).toBe(0); // old implementation does not use fragments, just flattening
        }
    });
});
