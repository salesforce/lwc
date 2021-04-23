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

        expect(Object.keys(extractDataIds(element))).toEqual([
            'x-light-parent',
            'x-shadow-child',
            'x-shadow-child.shadowRoot',
            'text',
        ]);

        expect(element.shadowRoot).toBeNull();
        expect(element.querySelector('div').innerText).toEqual('inside parent');
        expect(element.querySelector('x-shadow-child').shadowRoot).not.toBeNull();
        expect(
            element.querySelector('x-shadow-child').shadowRoot.querySelector('div').innerText
        ).toEqual('inside child');
    });
});
