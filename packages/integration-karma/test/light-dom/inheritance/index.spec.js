import { createElement, setFeatureFlagForTest } from 'lwc';

import Test from 'x/test';

describe('with base class light and subclass shadow', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
    });
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });
    it('should render properly', () => {
        const elm = createElement('x-test', { is: Test });
        expect(elm.shadowRoot).not.toBeNull();
    });
});
