import { createElement, setFeatureFlagForTest } from 'lwc';
import { extractDataIds } from 'test-utils';

import BasicSlot from 'x/basicSlot';
import DynamicChildren from 'x/dynamicChildren';
import LightConsumer from 'x/lightConsumer';
import ShadowConsumer from 'x/shadowConsumer';

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
    it('should render properly', () => {
        const nodes = createTestElement('x-default-slot', BasicSlot);

        expect(Array.from(nodes['x-container'].childNodes)).toEqual([
            nodes['container-upper-slot-top'],
            jasmine.any(Text),
            nodes['upper-text'],
            jasmine.any(Text),
            nodes['container-upper-slot-bottom'],
            nodes['container-default-slot-top'],
            jasmine.any(Text),
            nodes['default-text'],
            jasmine.any(Text),
            nodes['container-default-slot-bottom'],
            nodes['container-lower-slot-top'],
            jasmine.any(Text),
            nodes['lower-text'],
            jasmine.any(Text),
            nodes['container-lower-slot-bottom'],
        ]);
    });

    it('should render dynamic children', () => {
        const nodes = createTestElement('x-dynamic-children', DynamicChildren);
        expect(Array.from(nodes['x-container'].childNodes)).toEqual([
            nodes['container-upper-slot-top'],
            jasmine.any(Text),
            jasmine.any(Text),
            nodes['container-upper-slot-bottom'],
            nodes['container-default-slot-top'],
            jasmine.any(Text),
            nodes['1'],
            nodes['2'],
            nodes['3'],
            nodes['4'],
            nodes['5'],
            jasmine.any(Text),
            nodes['container-default-slot-bottom'],
            nodes['container-lower-slot-top'],
            jasmine.any(Text),
            jasmine.any(Text),
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
            '<x-light-container><p data-id="container-upper-slot-top">Upper slot top</p><p data-id="container-upper-slot-bottom">Default slot bottom</p><p data-id="container-default-slot-top">Default slot top</p><p data-id="shadow-consumer-text">Hello from Shadow DOM</p><p data-id="container-default-slot-bottom">Default slot bottom</p><p data-id="container-lower-slot-top">Lower slot top</p><p data-id="container-lower-slot-bottom">Lower slot bottom</p></x-light-container>'
        );
    });
});
