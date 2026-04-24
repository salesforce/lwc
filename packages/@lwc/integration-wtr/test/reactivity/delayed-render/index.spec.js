import { createElement, setFeatureFlagForTest } from 'lwc';

import Test from 'x/test';

// A bug (W-19830319) has shown that if child component properties are incorrectly marked for observation by the lifecycle, they can trigger the parent component to re-render
// and this will cause undesired effects. This bug manifested due to context connection/disconnection erroneously accessing properties, but it could theoretically occur in any instance where
// the "live" component property is accessed instead of via vm.cmpFields / vm.cmpProps.
describe('Unobserved properties should NOT trigger additional re-renders', () => {
    it('when signals is enabled and detached rehydration is enabled', async () => {
        setFeatureFlagForTest('ENABLE_EXPERIMENTAL_SIGNALS', true);
        setFeatureFlagForTest('DISABLE_DETACHED_REHYDRATION', true);

        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        elm.switchToEmptyTemplate();

        setTimeout(() => {
            expect(elm.renderCount).toBe(2);
        });
    });

    it('when signals is enabled', async () => {
        setFeatureFlagForTest('ENABLE_EXPERIMENTAL_SIGNALS', true);

        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        elm.switchToEmptyTemplate();

        setTimeout(() => {
            expect(elm.renderCount).toBe(2);
        });
    });

    it('when signals is disabled', async () => {
        setFeatureFlagForTest('ENABLE_EXPERIMENTAL_SIGNALS', false);

        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        elm.switchToEmptyTemplate();

        setTimeout(() => {
            expect(elm.renderCount).toBe(2);
        });
    });

    afterAll(() => {
        setFeatureFlagForTest('ENABLE_EXPERIMENTAL_SIGNALS', true);
        setFeatureFlagForTest('DISABLE_DETACHED_REHYDRATION', false);
    });
});
