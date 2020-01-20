import { createElement } from 'lwc';

import Test from 'x/test';
import LifecycleHooks from 'x/lifecycleHooks';

it('should remove existing event listeners', () => {
    let isInvoked = false;

    const listener = () => {
        isInvoked = true;
    };

    const elm = createElement('x-test', { is: Test });
    elm.listener = listener;
    document.body.appendChild(elm);

    elm.click();
    expect(isInvoked).toBe(true);

    isInvoked = false;
    elm.removeListener();
    elm.click();
    expect(isInvoked).toBe(false);
});

it('should not throw when invoking in the different lifecycle hooks', () => {
    expect(() => {
        const elm = createElement('x-lifecycle-hooks', { is: LifecycleHooks });
        document.body.appendChild(elm);
        document.body.removeChild(elm);
    }).not.toThrow();
});
