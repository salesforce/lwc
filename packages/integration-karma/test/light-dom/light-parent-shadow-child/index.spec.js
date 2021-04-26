import { createElement, setFeatureFlagForTest } from 'lwc';
import { extractDataIds } from 'test-utils';
import LightParent from 'x/lightParent';

describe('light parent with shadow child', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
    });

    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });

    it('should render properly', () => {
        const element = createElement('x-light-parent', { is: LightParent });
        element.setAttribute('data-id', 'x-light-parent');
        document.body.appendChild(element);

        const nodes = extractDataIds(element);
        expect(Object.keys(nodes)).toEqual([
            'x-light-parent',
            'parent-text',
            'x-shadow-child',
            'x-shadow-child.shadowRoot',
            'child-text',
        ]);

        expect(element.shadowRoot).toBeNull();
        expect(nodes['parent-text'].innerText).toEqual('inside parent');
        expect(nodes['x-shadow-child'].shadowRoot).not.toBeNull();
        expect(nodes['child-text'].innerText).toEqual('inside child');
    });
});
