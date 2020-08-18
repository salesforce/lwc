import { createElement } from 'lwc';

import LockerIntegration from 'x/lockerIntegration';
import LockerLiveComponent from 'x/lockerLiveComponent';
import LockerHooks, { hooks } from 'x/lockerHooks';

it('should support Locker integration which uses a wrapped LightningElement base class', () => {
    const elm = createElement('x-secure-parent', { is: LockerIntegration });
    document.body.appendChild(elm);

    // Verifying that shadow tree was created to ensure the component class was successfully processed
    const actual = elm.querySelector('div.secure');
    expect(actual).toBeDefined();
});

describe('Locker hooks', () => {
    const {
        getHook: originalGetHook,
        setHook: originalSetHook,
        callHook: originalCallHook,
    } = hooks;

    beforeEach(() => {
        spyOn(hooks, 'getHook').and.callThrough();
        spyOn(hooks, 'setHook').and.callThrough();
        spyOn(hooks, 'callHook').and.callThrough();
    });

    afterEach(() => {
        hooks.getHook = originalGetHook;
        hooks.setHook = originalSetHook;
        hooks.callHook = originalCallHook;
    });

    describe('getHook', () => {
        it('invokes getHook when reading a public property', () => {
            const elm = createElement('x-hooks', { is: LockerHooks });
            elm.publicProp;

            expect(hooks.getHook).toHaveBeenCalledTimes(1);
            expect(hooks.getHook).toHaveBeenCalledWith(jasmine.any(Object), 'publicProp');
        });

        it('invokes getHook when reading a public property via an accessor', () => {
            const elm = createElement('x-hooks', { is: LockerHooks });
            elm.publicAccessor;

            expect(hooks.getHook).toHaveBeenCalledTimes(1);
            expect(hooks.getHook).toHaveBeenCalledWith(jasmine.any(Object), 'publicAccessor');
        });
    });

    describe('setHook', () => {
        it('invokes setHook when assigning a public property', () => {
            const elm = createElement('x-hooks', { is: LockerHooks });
            elm.publicProp = 1;

            expect(hooks.setHook).toHaveBeenCalledTimes(1);
            expect(hooks.setHook).toHaveBeenCalledWith(jasmine.any(Object), 'publicProp', 1);
        });

        it('invokes setHook when assigning a public property via an accessor', () => {
            const elm = createElement('x-hooks', { is: LockerHooks });
            elm.publicAccessor = 1;

            expect(hooks.setHook).toHaveBeenCalledTimes(1);
            expect(hooks.setHook).toHaveBeenCalledWith(jasmine.any(Object), 'publicAccessor', 1);
        });
    });

    describe('callHook', () => {
        it('invokes callHook when invoking a public method', () => {
            const elm = createElement('x-hooks', { is: LockerHooks });
            elm.publicMethod(1, 'foo');

            expect(hooks.callHook).toHaveBeenCalledTimes(1);
            expect(hooks.callHook).toHaveBeenCalledWith(
                jasmine.any(Object),
                jasmine.any(Function),
                [1, 'foo']
            );
        });

        it('should invoke callHook for all the lifecycle hooks', () => {
            const elm = createElement('x-hooks', { is: LockerHooks });

            document.body.appendChild(elm);
            document.body.removeChild(elm);

            expect(hooks.callHook).toHaveBeenCalledTimes(4);

            const invokedMethods = hooks.callHook.calls.allArgs().map(([_, method]) => method.name);
            expect(invokedMethods).toEqual([
                'connectedCallback',
                'render',
                'renderedCallback',
                'disconnectedCallback',
            ]);
        });

        it('should invoke callHook when invoking event handlers', () => {
            const elm = createElement('x-hooks', { is: LockerHooks });
            document.body.appendChild(elm);

            const evt = new CustomEvent('test');
            elm.shadowRoot.querySelector('div').dispatchEvent(evt);

            expect(hooks.callHook).toHaveBeenCalledWith(
                jasmine.any(Object),
                jasmine.any(Function),
                [evt]
            );
        });
    });
});

describe('Locker live objects', () => {
    it('should report the component instance as live to support expandos', () => {
        const elm = createElement('x-live', { is: LockerLiveComponent });
        document.body.appendChild(elm);
        expect(elm.hasMarker()).toBe(true);
    });
});
