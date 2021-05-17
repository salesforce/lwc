import { createElement, setFeatureFlagForTest } from 'lwc';
import { extractDataIds } from 'test-utils';

import BasicSlot from 'x/basicSlot';
import DynamicChildren from 'x/dynamicChildren';

// eslint-disable-next-line jest/no-focused-tests
describe('Slotting', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
    });
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });
    it('should render properly', () => {
        const elm = createElement('x-default-slot', { is: BasicSlot });
        document.body.appendChild(elm);
        const nodes = extractDataIds(elm);

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
        const elm = createElement('x-default-slot', { is: DynamicChildren });
        document.body.appendChild(elm);
        const nodes = extractDataIds(elm);
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
});
