import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import BasicSlot from 'x/basicSlot';
import DynamicChildren from 'x/dynamicChildren';
import LightConsumer from 'x/lightConsumer';
import ShadowConsumer from 'x/shadowConsumer';
import ConditionalSlot from 'x/conditionalSlot';
import ConditionalSlotted from 'x/conditionalSlotted';

function createTestElement(tag, component) {
    const elm = createElement(tag, { is: component });
    elm.setAttribute('data-id', tag);
    document.body.appendChild(elm);
    return extractDataIds(elm);
}

describe('Slotting', () => {
    it('should render properly', () => {
        const nodes = createTestElement('x-default-slot', BasicSlot);

        expect(Array.from(nodes['x-container'].childNodes)).toEqual([
            nodes['upper-text'],
            nodes['default-text'],
            nodes['lower-text'],
        ]);
    });

    it('should render dynamic children', async () => {
        const nodes = createTestElement('x-dynamic-children', DynamicChildren);
        expect(Array.from(nodes['x-light-container'].childNodes)).toEqual([
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

        expect(Array.from(nodes['x-light-container'].childNodes)).toEqual([
            nodes['container-upper-slot-default'],
            nodes['5'],
            nodes['4'],
            nodes['3'],
            nodes['2'],
            nodes['1'],
            nodes['container-lower-slot-default'],
        ]);
    });

    it('shadow container, light consumer', () => {
        const nodes = createTestElement('x-light-consumer', LightConsumer);

        expect(nodes['x-light-consumer'].innerHTML).toEqual(
            '<x-shadow-container><p data-id="light-consumer-text">Hello from Light DOM</p></x-shadow-container>'
        );
    });

    it('light container, shadow consumer', () => {
        const nodes = createTestElement('x-shadow-consumer', ShadowConsumer);

        expect(nodes['x-shadow-consumer'].shadowRoot.innerHTML).toEqual(
            '<x-light-container><p data-id="container-upper-slot-default">Upper slot default</p><p data-id="shadow-consumer-text">Hello from Shadow DOM</p><p data-id="container-lower-slot-default">Lower slot default</p></x-light-container>'
        );
    });

    it('removes slots properly', async () => {
        const nodes = createTestElement('x-conditional-slot', ConditionalSlot);
        const elm = nodes['x-conditional-slot'];
        expect(Array.from(elm.childNodes)).toEqual([nodes['default-slotted-text'], nodes.button]);
        nodes.button.click();
        await Promise.resolve();
        expect(Array.from(elm.childNodes)).toEqual([nodes.button]);
    });

    it('removes slotted content properly', async () => {
        const nodes = createTestElement('x-conditional-slotted', ConditionalSlotted);
        const elm = nodes['x-conditional-slotted'];
        expect(elm.innerHTML).toEqual(
            '<x-conditional-slot data-id="conditional-slot"><p data-id="slotted-text">Slotted content</p><button data-id="button">Toggle</button></x-conditional-slot>'
        );
        nodes.button.click();
        await Promise.resolve();
        expect(elm.innerHTML).toEqual(
            '<x-conditional-slot data-id="conditional-slot"><button data-id="button">Toggle</button></x-conditional-slot>'
        );
    });
});
