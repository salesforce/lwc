import { createElement } from 'lwc';

import Test from 'c/test';
import LifecycleHooks from 'c/lifecycleHooks';
import RemovalWhileDispatch from 'c/removalWhileDispatch';

it('should remove existing event listeners', () => {
    let isInvoked = false;

    const listener = () => {
        isInvoked = true;
    };

    const elm = createElement('c-test', { is: Test });
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
        const elm = createElement('c-lifecycle-hooks', { is: LifecycleHooks });
        document.body.appendChild(elm);
        document.body.removeChild(elm);
    }).not.toThrow();
});

it('should not invoke listener that is removed while being dispatched', () => {
    const elm = createElement('c-removal-while-dispatch', { is: RemovalWhileDispatch });

    let evt;
    elm.addEventListener('test', (e) => (evt = e));

    document.body.appendChild(elm);

    expect(evt).not.toBeUndefined();
    expect(evt.detail).toEqual({
        handlers: ['a'],
    });
});
