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
        // Specific sequence (it is rather nuanced and requires 1. parent to switch templates and 2. child to mutate a property in a setTimeout function or similar):
        // 1. The template change results in the parent component being marked as dirty.
        // 1a. Marking the parent as dirty sets the currentReactiveObserver to the parent, here: https://github.com/salesforce/lwc/blob/master/packages/%40lwc/engine-core/src/libs/mutation-tracker/index.ts#L83
        // 2. The new template doesn't contain the child so disconnectContext is called on the child component. The BUG: If the child properties are incorrectly observed then riggering disconnectContext marks all child properties
        // for observation using the currentReactiveObserver of the parent set in 1a. here: https://github.com/salesforce/lwc/blob/master/packages/%40lwc/engine-core/src/libs/mutation-tracker/index.ts#L60
        // 3. Next, a delayed property mutation inside the child component's renderedCallback occurs and this delayed (post disconnection) mutation triggers valueMutated, where all the parent properties are registered listeners.
        // That happens here: https://github.com/salesforce/lwc/blob/master/packages/%40lwc/engine-core/src/libs/mutation-tracker/index.ts#L41
        // 3b. This causes the parent component to re-render.
        elm.switchToEmptyTemplate();

        // Before the bugfix (W-19830319/PR-5536), expecting 2 renders when signals was enabled would fail.
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
