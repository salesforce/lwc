import {
    installTrap,
    findDescriptor
} from '../property-trap';
import { ConfigContext } from '../wiring';

describe('findDescriptor', () => {
    it('detects circular prototype chains', () => {
        function A() { /**/ }
        function B() { /**/ }
        B.prototype = Object.create(A.prototype);
        A.prototype = Object.create(B.prototype);
        const actual = findDescriptor(B, 'target');
        expect(actual).toBe(null);
    });

    it('finds descriptor on super with prototype setting', () => {
        function A() { /**/ }
        A.prototype.target = 'target';
        function B() { /**/ }
        B.prototype = Object.create(A.prototype);
        expect(findDescriptor(B, 'target')).toBe(null);
        expect(findDescriptor(new B(), 'target')).not.toBe(null);
    });

    it('finds descriptor on super with classes', () => {
        class A {
            target: any;
            constructor() {
                this.target = 'target';
            }
        }
        class B extends A {}
        expect(findDescriptor(B, 'target')).toBe(null);
        expect(findDescriptor(new B(), 'target')).not.toBe(null);
     });
});

describe('installTrap', () => {
    const context = {
        listeners: {
            prop1: []
        },
        values: {
            prop1: ''
        }
    } as ConfigContext;

    it('defaults to original value when setter installed', () => {
        class Target {
            prop1 = 'initial';
        }
        const cmp = new Target();
        installTrap(cmp, 'prop1', context);
        expect(cmp.prop1).toBe('initial');
    });
    it('updates original property when installed setter invoked', () => {
        const expected = 'expected';
        class Target {
            prop1;
        }
        const cmp = new Target();
        installTrap(cmp, 'prop1', context);
        cmp.prop1 = expected;
        expect(cmp.prop1).toBe(expected);
    });
    it('installs setter on cmp for property', () => {
        class Target {
            set prop1(value) { /**/ }
        }
        const original = Object.getOwnPropertyDescriptor(Target.prototype, 'prop1');
        const cmp = new Target();
        installTrap(cmp, 'prop1', context);
        const descriptor = Object.getOwnPropertyDescriptor(cmp, 'prop1');
        if (descriptor && original) {
            expect(descriptor.set).not.toBe(original.set);
        }
    });
    it('invokes original setter when installed setter invoked', () => {
        const setter = jest.fn();
        const expected = 'expected';
        class Target {
            set prop1(value) {
                setter(value);
            }
            get prop1() { return ''; }
        }
        const cmp = new Target();
        installTrap(cmp, 'prop1', context);
        cmp.prop1 = expected;
        expect(setter).toHaveBeenCalledTimes(1);
        expect(setter).toHaveBeenCalledWith(expected);
    });
});

describe('invokeConfigListeners', () => {
    it('invokes listener with new value', () => {
        const expected = 'expected';
        const listener = jest.fn();
        const context = {
            listeners: {
                prop1: [{ listener, params: { param1: 'prop1' } }]
            },
            values: {
                prop1: ''
            }
        } as ConfigContext;
        class Target {
            prop1;
        }
        const cmp = new Target();
        installTrap(cmp, 'prop1', context);
        cmp.prop1 = expected;
        return Promise.resolve().then(() => {
            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener.mock.calls[0][0]).toEqual({ param1: expected });
        });
    });

    it('does not invoke listener if param value is unchanged', () => {
        const expected = 'expected';
        const listener = jest.fn();
        const context = {
            listeners: {
                prop1: [{ listener, params: { param1: 'prop1' } }]
            },
            values: {
                prop1: 'expected'
            }
        } as ConfigContext;
        class Target {
            prop1;
        }
        const cmp = new Target();
        installTrap(cmp, 'prop1', context);
        cmp.prop1 = expected;
        return Promise.resolve().then(() => {
            expect(listener).toHaveBeenCalledTimes(0);
        });
    });

    it('invokes listener with getter value', () => {
        const expected = 'expected';
        const listener = jest.fn();
        const context = {
            listeners: {
                prop1: [{ listener, params: { param1: 'prop1' } }]
            },
            values: {
                prop1: ''
            }
        } as ConfigContext;
        class Target {
            set prop1(value) { /**/ }
            get prop1() { return expected; }
        }
        const cmp = new Target();
        installTrap(cmp, 'prop1', context);
        cmp.prop1 = 'unexpected';
        return Promise.resolve().then(() => {
            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener.mock.calls[0][0]).toEqual({ param1: expected });
        });
    });
});
