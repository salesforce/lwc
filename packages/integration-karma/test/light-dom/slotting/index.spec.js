import { createElement, setFeatureFlagForTest } from 'lwc';
import { extractDataIds } from 'test-utils';

import BasicSlot from 'x/basicSlot';
import DynamicChildren from 'x/dynamicChildren';
import LightConsumer from 'x/lightConsumer';
import ShadowConsumer from 'x/shadowConsumer';
import ConditionalSlot from 'x/conditionalSlot';

function createTestElement(tag, component) {
    const elm = createElement(tag, { is: component });
    elm.setAttribute('data-id', tag);
    document.body.appendChild(elm);
    return extractDataIds(elm);
}

describe('Slotting', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
    });
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });
    // eslint-disable-next-line jest/no-focused-tests
    it('should render properly', () => {
        const nodes = createTestElement('x-default-slot', BasicSlot);

        expect(Array.from(nodes['x-container'].childNodes)).toEqual([
            nodes['container-upper-slot-top'],
            nodes['upper-text'],
            nodes['container-upper-slot-bottom'],
            nodes['container-default-slot-top'],
            nodes['default-text'],
            nodes['container-default-slot-bottom'],
            nodes['container-lower-slot-top'],
            nodes['lower-text'],
            nodes['container-lower-slot-bottom'],
        ]);
    });

    it('should render dynamic children', async () => {
        const nodes = createTestElement('x-dynamic-children', DynamicChildren);
        expect(Array.from(nodes['x-light-container'].childNodes)).toEqual([
            nodes['container-upper-slot-top'],
            nodes['container-upper-slot-default'],
            nodes['container-upper-slot-bottom'],
            nodes['container-default-slot-top'],
            nodes['1'],
            nodes['2'],
            nodes['3'],
            nodes['4'],
            nodes['5'],
            nodes['container-default-slot-bottom'],
            nodes['container-lower-slot-top'],
            nodes['container-lower-slot-default'],
            nodes['container-lower-slot-bottom'],
        ]);

        nodes.button.click();
        await Promise.resolve();

        expect(Array.from(nodes['x-light-container'].childNodes)).toEqual([
            nodes['container-upper-slot-top'],
            nodes['container-upper-slot-default'],
            nodes['container-upper-slot-bottom'],
            nodes['container-default-slot-top'],
            nodes['5'],
            nodes['4'],
            nodes['3'],
            nodes['2'],
            nodes['1'],
            nodes['container-default-slot-bottom'],
            nodes['container-lower-slot-top'],
            nodes['container-lower-slot-default'],
            nodes['container-lower-slot-bottom'],
        ]);
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
            '<x-light-container><p data-id="container-upper-slot-top">Upper slot top</p><p data-id="container-upper-slot-default">Upper slot default</p><p data-id="container-upper-slot-bottom">Default slot bottom</p><p data-id="container-default-slot-top">Default slot top</p><p data-id="shadow-consumer-text">Hello from Shadow DOM</p><p data-id="container-default-slot-bottom">Default slot bottom</p><p data-id="container-lower-slot-top">Lower slot top</p><p data-id="container-lower-slot-default">Lower slot default</p><p data-id="container-lower-slot-bottom">Lower slot bottom</p></x-light-container>'
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
});
