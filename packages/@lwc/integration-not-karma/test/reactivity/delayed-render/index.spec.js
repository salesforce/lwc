import { createElement, setFeatureFlagForTest } from 'lwc';

import Test from 'x/test';

// A bug (W-19830319) has shown that if child component properties are incorrectly marked for observation by the lifecycle, they can trigger the parent component to re-render
// and this will cause undesired effects. This bug manifested due to context connection/disconnection erroneously accessing properties, but it could theoretically occur in any instance where
// the "live" component property is accessed instead of via vm.cmpFields / vm.cmpProps.
describe('Unobserved properties should NOT trigger re-renders', () => {
    it('when signals is enabled', async () => {
        // This is on by default, but enabled here to confirm the case
        setFeatureFlagForTest('ENABLE_EXPERIMENTAL_SIGNALS', true);

        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        // This will:
        // 1. Mark the parent component as dirty as the component template is changed.
        // 2. Trigger disconnectContext on the child component which will mark each child property for observation, with the parent properties as the listeners.
        // 3. Trigger a delayed mutation on the child in the child renderedCallback.
        // 4. The erroneously observed properties will trigger a re-render of the parent as the parent properties are listening.
        elm.switchToEmptyTemplate();

        // Before the bugfix (W-19830319/PR-XXX), expecting 2 renders when signals was enabled would fail.
        // An erroneous 3rd render would occur when signals was enabled due to the behavior described above.
        setTimeout(() => {
            expect(elm.renderCount).toBe(2); // pre-fix, this will fail as it will render 3 times.
        });
    });

    // Test with the signals flag disabled for completness
    it('when signals is disabled', async () => {
        setFeatureFlagForTest('ENABLE_EXPERIMENTAL_SIGNALS', false);

        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        elm.switchToEmptyTemplate();

        // CORRECT: This component should render twice.
        setTimeout(() => {
            expect(elm.renderCount).toBe(2);
        });
    });
});
