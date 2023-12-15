import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import { vFragBookEndEnabled, lightDomSlotForwardingEnabled } from 'test-utils';

import BasicSlot from 'x/basicSlot';
import DynamicChildren from 'x/dynamicChildren';
import LightConsumer from 'x/lightConsumer';
import ShadowConsumer from 'x/shadowConsumer';
import ConditionalSlot from 'x/conditionalSlot';
import ConditionalSlotted from 'x/conditionalSlotted';
import ForwardedSlotConsumer from 'x/forwardedSlotConsumer';

const vFragBookend = vFragBookEndEnabled ? '<!---->' : '';

function createTestElement(tag, component) {
    const elm = createElement(tag, { is: component });
    elm.setAttribute('data-id', tag);
    document.body.appendChild(elm);
    return extractDataIds(elm);
}

describe('Slotting', () => {
    it('should render properly', () => {
        const nodes = createTestElement('x-default-slot', BasicSlot);

        expect(Array.from(nodes['x-container'].children)).toEqual([
            nodes['upper-text'],
            nodes['default-text'],
            nodes['lower-text'],
        ]);
    });

    it('should render dynamic children', async () => {
        const nodes = createTestElement('x-dynamic-children', DynamicChildren);
        expect(Array.from(nodes['x-light-container'].children)).toEqual([
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

        expect(Array.from(nodes['x-light-container'].children)).toEqual([
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
        const nodes = createTestElement('x-dynamic-children', DynamicChildren);

        expect(nodes['container-upper-slot-default'].assignedSlot).toBeNull();
        expect(nodes['container-lower-slot-default'].assignedSlot).toBeNull();
    });

    it('shadow container, light consumer', () => {
        const nodes = createTestElement('x-light-consumer', LightConsumer);

        const expected = process.env.NATIVE_SHADOW // native shadow doesn't output slots in innerHTML
            ? '<x-shadow-container><p data-id="light-consumer-text">Hello from Light DOM</p></x-shadow-container>'
            : '<x-shadow-container><slot><p data-id="light-consumer-text">Hello from Light DOM</p></slot></x-shadow-container>';
        expect(nodes['x-light-consumer'].innerHTML).toEqual(expected);
    });

    it('light container, shadow consumer', () => {
        const nodes = createTestElement('x-shadow-consumer', ShadowConsumer);

        expect(nodes['x-shadow-consumer'].shadowRoot.innerHTML).toEqual(
            `<x-light-container>${vFragBookend}<p data-id="container-upper-slot-default">Upper slot default</p>${vFragBookend}${vFragBookend}<p data-id="shadow-consumer-text">Hello from Shadow DOM</p>${vFragBookend}${vFragBookend}<p data-id="container-lower-slot-default">Lower slot default</p>${vFragBookend}</x-light-container>`
        );
    });

    it('removes slots properly', async () => {
        const nodes = createTestElement('x-conditional-slot', ConditionalSlot);
        const elm = nodes['x-conditional-slot'];
        expect(Array.from(elm.children)).toEqual([nodes['default-slotted-text'], nodes.button]);
        nodes.button.click();
        await Promise.resolve();
        expect(Array.from(elm.children)).toEqual([nodes.button]);
    });

    it('removes slotted content properly', async () => {
        const nodes = createTestElement('x-conditional-slotted', ConditionalSlotted);
        const elm = nodes['x-conditional-slotted'];
        expect(elm.innerHTML).toEqual(
            `<x-conditional-slot data-id="conditional-slot">${vFragBookend}<p data-id="slotted-text">Slotted content</p>${vFragBookend}<button data-id="button">Toggle</button></x-conditional-slot>`
        );
        nodes.button.click();
        await Promise.resolve();
        expect(elm.innerHTML).toEqual(
            '<x-conditional-slot data-id="conditional-slot"><button data-id="button">Toggle</button></x-conditional-slot>'
        );
    });

    it('should forward slots', () => {
        const nodes = createTestElement('x-forwarded-slot-consumer', ForwardedSlotConsumer);
        const elm = nodes['x-forwarded-slot-consumer'];
        expect(elm.innerHTML).toEqual(
            lightDomSlotForwardingEnabled
                ? `<x-forwarded-slot><x-light-container>${vFragBookend}<p>Upper slot content forwarded</p>${vFragBookend}${vFragBookend}<p>Default slot forwarded</p>${vFragBookend}${vFragBookend}<p>Lower slot content forwarded</p>${vFragBookend}</x-light-container></x-forwarded-slot>`
                : `<x-forwarded-slot><x-light-container>${vFragBookend}<p slot="upper">Upper slot content forwarded</p>${vFragBookend}${vFragBookend}<p>Default slot forwarded</p>${vFragBookend}${vFragBookend}<p slot="lower">Lower slot content forwarded</p>${vFragBookend}</x-light-container></x-forwarded-slot>`
        );
    });
    it('should render default content in forwarded slots', async () => {
        const nodes = createTestElement('x-forwarded-slot-consumer', ForwardedSlotConsumer);
        const elm = nodes['x-forwarded-slot-consumer'];
        elm.shouldSlot(false);

        await Promise.resolve();
        expect(elm.innerHTML).toEqual(
            `<x-forwarded-slot><x-light-container>${vFragBookend}<p data-id="container-upper-slot-default">Upper slot default</p>${vFragBookend}${vFragBookend}Default slot not yet forwarded${vFragBookend}${vFragBookend}<p data-id="container-lower-slot-default">Lower slot default</p>${vFragBookend}</x-light-container></x-forwarded-slot>`
        );
    });

    it('should only generate empty text nodes for APIVersion >=60', async () => {
        const elm = createElement('x-default-slot', { is: BasicSlot });
        document.body.appendChild(elm);
        await Promise.resolve();
        const container = elm.querySelector('x-light-container');
        const commentNodes = [...container.childNodes].filter(
            (_) => _.nodeType === Node.COMMENT_NODE
        );
        if (process.env.API_VERSION <= 59) {
            expect(commentNodes.length).toBe(0); // old implementation does not use fragments, just flattening
        } else {
            expect(commentNodes.length).toBe(6); // 3 slots, so 3*2=6 comment nodes
        }
    });
});
