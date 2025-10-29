import { createElement, setFeatureFlagForTest } from 'lwc';

import LockerIntegration from 'c/lockerIntegration';
import LockerLiveComponent from 'c/lockerLiveComponent';
import LockerHooks, { hooks } from 'c/lockerHooks';
import { spyOn } from '@vitest/spy';
beforeEach(() => {
    setFeatureFlagForTest('LEGACY_LOCKER_ENABLED', true);
});
afterEach(() => {
    setFeatureFlagForTest('LEGACY_LOCKER_ENABLED', false);
});
it('should support Locker integration which uses a wrapped LightningElement base class', () => {
    const elm = createElement('c-secure-parent', { is: LockerIntegration });
    document.body.appendChild(elm);

    // Verifying that shadow tree was created to ensure the component class was successfully processed
    const actual = elm.querySelector('div.secure');
    expect(actual).toBeDefined();
});

describe('Locker hooks', () => {
    let getHookSpy;
    let setHookSpy;
    let callHookSpy;
    beforeAll(() => {
        getHookSpy = spyOn(hooks, 'getHook');
        setHookSpy = spyOn(hooks, 'setHook');
        callHookSpy = spyOn(hooks, 'callHook');
    });

    afterEach(() => {
        getHookSpy.mockReset();
        setHookSpy.mockReset();
        callHookSpy.mockReset();
    });

    afterAll(() => {
        getHookSpy.mockRestore();
        setHookSpy.mockRestore();
        callHookSpy.mockRestore();
    });

    describe('getHook', () => {
        it('invokes getHook when reading a public property', () => {
            const elm = createElement('c-hooks', { is: LockerHooks });
            // Testing the getter; don't need to use the return value
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            elm.publicProp;

            expect(getHookSpy).toHaveBeenCalledTimes(1);
            expect(getHookSpy).toHaveBeenCalledWith(expect.any(Object), 'publicProp');
        });

        it('invokes getHook when reading a public property via an accessor', () => {
            const elm = createElement('c-hooks', { is: LockerHooks });
            // Testing the getter; don't need to use the return value
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            elm.publicAccessor;

            expect(getHookSpy).toHaveBeenCalledTimes(1);
            expect(getHookSpy).toHaveBeenCalledWith(expect.any(Object), 'publicAccessor');
        });
    });

    describe('setHook', () => {
        it('invokes setHook when assigning a public property', () => {
            const elm = createElement('c-hooks', { is: LockerHooks });
            elm.publicProp = 1;

            expect(setHookSpy).toHaveBeenCalledTimes(1);
            expect(setHookSpy).toHaveBeenCalledWith(expect.any(Object), 'publicProp', 1);
        });

        it('invokes setHook when assigning a public property via an accessor', () => {
            const elm = createElement('c-hooks', { is: LockerHooks });
            elm.publicAccessor = 1;

            expect(setHookSpy).toHaveBeenCalledTimes(1);
            expect(setHookSpy).toHaveBeenCalledWith(expect.any(Object), 'publicAccessor', 1);
        });
    });

    describe('callHook', () => {
        it('invokes callHook when invoking a public method', () => {
            const elm = createElement('c-hooks', { is: LockerHooks });
            elm.publicMethod(1, 'foo');

            expect(callHookSpy).toHaveBeenCalledTimes(1);
            expect(callHookSpy).toHaveBeenCalledWith(expect.any(Object), expect.any(Function), [
                1,
                'foo',
            ]);
        });

        it('should invoke callHook for all the lifecycle hooks', () => {
            const elm = createElement('c-hooks', { is: LockerHooks });

            document.body.appendChild(elm);
            document.body.removeChild(elm);

            expect(callHookSpy).toHaveBeenCalledTimes(4);

            const invokedMethods = callHookSpy.mock.calls.map(([_, method]) => method.name);
            expect(invokedMethods).toEqual([
                'connectedCallback',
                'render',
                'renderedCallback',
                'disconnectedCallback',
            ]);
        });

        it('should invoke callHook when invoking event handlers', () => {
            const elm = createElement('c-hooks', { is: LockerHooks });
            document.body.appendChild(elm);

            const evt = new CustomEvent('test');
            elm.shadowRoot.querySelector('div').dispatchEvent(evt);

            expect(callHookSpy).toHaveBeenCalledWith(expect.any(Object), expect.any(Function), [
                evt,
            ]);
        });
    });
});

describe('Locker live objects', () => {
    it('should report the component instance as live to support expandos', () => {
        const elm = createElement('c-live', { is: LockerLiveComponent });
        document.body.appendChild(elm);
        expect(elm.hasMarker()).toBe(true);
    });
});
