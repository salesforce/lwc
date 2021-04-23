import { createElement, setFeatureFlagForTest } from 'lwc';

import Test from 'x/test';

describe('with base class light and subclass shadow', () => {
    it('should render properly', () => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);

        const elm = createElement('x-test', { is: Test });
        expect(elm.shadowRoot).not.toBeNull();

        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });
});
