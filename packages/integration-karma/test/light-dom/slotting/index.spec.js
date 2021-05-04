import { createElement, setFeatureFlagForTest } from 'lwc';
import { extractDataIds } from 'test-utils';

import DefaultSlot from 'x/defaultSlot';
import DynamicChildren from 'x/dynamicChildren';

describe('Slotting', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
    });
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });
    it('should render properly', () => {
        const elm = createElement('x-default-slot', { is: DefaultSlot });
        document.body.appendChild(elm);
        const nodes = extractDataIds(elm);

        expect(Array.from(nodes['x-container'].childNodes)).toEqual([
            nodes['container-default-slot-top'],
            jasmine.any(Object),
            nodes['default-text'],
            jasmine.any(Object),
            nodes['container-default-slot-bottom'],
        ]);
    });

    it('should render dynamic children', () => {
        const elm = createElement('x-default-slot', { is: DynamicChildren });
        document.body.appendChild(elm);
        const nodes = extractDataIds(elm);
        expect(Array.from(nodes['x-container'].childNodes)).toEqual([
            nodes['container-default-slot-top'],
            jasmine.any(Object),
            nodes['1'],
            nodes['2'],
            nodes['3'],
            nodes['4'],
            nodes['5'],
            jasmine.any(Object),
            nodes['container-default-slot-bottom'],
        ]);
    });
});
