import { createElement, setFeatureFlagForTest } from 'lwc';
import { extractDataIds } from 'test-utils';

import Container from 'x/container';

describe('shadow parent with light child', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
    });

    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });
    it('should render properly', () => {
        const element = createElement('x-container', { is: Container });
        element.setAttribute('data-id', 'x-container');
        document.body.appendChild(element);
        expect(Object.keys(extractDataIds(element))).toEqual([
            'x-container',
            'x-container.shadowRoot',
            'x-test',
            'text',
        ]);

        expect(element.shadowRoot).not.toBeNull();
        expect(element.shadowRoot.querySelector('p').innerText).toEqual('Hello, Shadow DOM');
        expect(element.shadowRoot.querySelector('x-test').shadowRoot).toBeNull();
        expect(element.shadowRoot.querySelector('x-test').querySelector('p').innerText).toEqual(
            'Hello, Light DOM'
        );
    });
});
