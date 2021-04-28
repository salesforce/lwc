import { createElement, setFeatureFlagForTest } from 'lwc';

import Slotted from 'x/slotted';

describe('slotted content', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
    });

    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });

    it('should throw when attempting to render a slotted content in the light DOM', () => {
        const element = createElement('x-slotted', { is: Slotted });

        expect(() => {
            document.body.appendChild(element);
        }).toThrowError(
            /Invalid usage of <x-container>\. Light DOM components don't support slotting yet\./
        );
    });
});
