import {
    installTrap,
    findDescriptor,
    getParamValue
} from '../property-trap';
import { ConfigContext, ParamDefinition } from '../wiring';

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
    const context: ConfigContext = {
        listeners: {
            prop1: []
        },
        values: {
            prop1: ''
        }
    };
    const prop1Defn: ParamDefinition = {
        full: 'prop1',
        root: 'prop1'
    };

    it('defaults to original value when setter installed', () => {
        class Target {
            prop1 = 'initial';
        }
        const cmp = new Target();
        installTrap(cmp, prop1Defn, context);
        expect(cmp.prop1).toBe('initial');
    });

    it('updates original property when installed setter invoked', () => {
        const expected = 'expected';
        class Target {
            prop1;
        }
        const cmp = new Target();
        installTrap(cmp, prop1Defn, context);
        cmp.prop1 = expected;
        expect(cmp.prop1).toBe(expected);
    });

    it('installs setter on cmp for property', () => {
        class Target {
            set prop1(value) { /**/ }
        }
        const original = Object.getOwnPropertyDescriptor(Target.prototype, 'prop1');
        const cmp = new Target();
        installTrap(cmp, prop1Defn, context);
        const descriptor = Object.getOwnPropertyDescriptor(cmp, 'prop1');
        expect(descriptor!.set).not.toBe(original!.set);
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
        installTrap(cmp, prop1Defn, context);
        cmp.prop1 = expected;
        expect(setter).toHaveBeenCalledTimes(1);
        expect(setter).toHaveBeenCalledWith(expected);
    });

    it('installs setter on cmp for paramDefn.root', () => {
        const propDefn: ParamDefinition = {
            full: 'prop1.x.y',
            root: 'prop1'
        };
        class Target {
            set prop1(value) { /**/ }
        }
        const original = Object.getOwnPropertyDescriptor(Target.prototype, 'prop1');
        const cmp = new Target();
        installTrap(cmp, propDefn, context);
        const descriptor = Object.getOwnPropertyDescriptor(cmp, 'prop1');
        expect(descriptor!.set).not.toBe(original!.set);
        expect(Object.getOwnPropertyDescriptor(Target.prototype, 'prop1.x.y')).toBeUndefined();
    });
});

describe('invokeConfigListeners', () => {
    const prop1Defn: ParamDefinition = {
        full: 'prop1',
        root: 'prop1'
    };

    it('invokes listener with new value', () => {
        const expected = 'expected';
        const listener = jest.fn();
        const context: ConfigContext = {
            listeners: {
                prop1: [{ listener, params: { param1: 'prop1' } }]
            },
            values: {
                prop1: ''
            }
        };
        class Target {
            prop1;
        }
        const cmp = new Target();
        installTrap(cmp, prop1Defn, context);
        cmp.prop1 = expected;
        return Promise.resolve().then(() => {
            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener.mock.calls[0][0]).toEqual({ param1: expected });
        });
    });

    it('does not invoke listener if param value is unchanged', () => {
        const expected = 'expected';
        const listener = jest.fn();
        const context: ConfigContext = {
            listeners: {
                prop1: [{ listener, params: { param1: 'prop1' } }]
            },
            values: {
                prop1: 'expected'
            }
        };
        class Target {
            prop1;
        }
        const cmp = new Target();
        installTrap(cmp, prop1Defn, context);
        cmp.prop1 = expected;
        return Promise.resolve().then(() => {
            expect(listener).toHaveBeenCalledTimes(0);
        });
    });

    it('invokes listener with getter value', () => {
        const expected = 'expected';
        const listener = jest.fn();
        const context: ConfigContext = {
            listeners: {
                prop1: [{ listener, params: { param1: 'prop1' } }]
            },
            values: {
                prop1: ''
            }
        };
        class Target {
            set prop1(value) { /**/ }
            get prop1() { return expected; }
        }
        const cmp = new Target();
        installTrap(cmp, prop1Defn, context);
        cmp.prop1 = 'unexpected';
        return Promise.resolve().then(() => {
            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener.mock.calls[0][0]).toEqual({ param1: expected });
        });
    });
});

describe('getParamValue', () => {
    it('returns leaf in object graph', () => {
        const expected = 'expected';
        const paramDefn: ParamDefinition = {
            full: 'a.b.c.d',
            root: 'a',
            remainder: ['b', 'c', 'd']
        };
        class Target {
            a = { b: { c: { d: expected }}};
        }
        expect(getParamValue(new Target(), paramDefn)).toBe(expected);
    });

    it('returns tree in object graph', () => {
        const expected = { e: { f: 'expected' }};
        const paramDefn: ParamDefinition = {
            full: 'a.b.c.d',
            root: 'a',
            remainder: ['b', 'c', 'd']
        };
        class Target {
            a = { b: { c: { d: expected }}};
        }
        expect(getParamValue(new Target(), paramDefn)).toBe(expected);
    });

    it('returns undefined if root is undefined', () => {
        const paramDefn: ParamDefinition = {
            full: 'a.b.c.d',
            root: 'a',
            remainder: ['b', 'c', 'd']
        };
        class Target {
            // a does not exist
        }
        expect(getParamValue(new Target(), paramDefn)).toBeUndefined();
    });

    it('returns undefined if a segment is undefined', () => {
        const paramDefn: ParamDefinition = {
            full: 'a.b.c.d',
            root: 'a',
            remainder: ['b', 'c', 'd']
        };
        class Target {
            a = { b: undefined };
        }
        expect(getParamValue(new Target(), paramDefn)).toBeUndefined();
    });

    it('returns undefined if a segment is not found', () => {
        const paramDefn: ParamDefinition = {
            full: 'a.b.c.d',
            root: 'a',
            remainder: ['b', 'c', 'd']
        };
        class Target {
            a = { b: {} };
        }
        expect(getParamValue(new Target(), paramDefn)).toBeUndefined();
    });

    it('supports pathing with returns value in object graph', () => {
        const expected = 'expected';
        const paramDefn: ParamDefinition = {
            full: 'a..b.c.d',
            root: 'a',
            remainder: ['', 'b', 'c', 'd']
        };
        class Target {
            a = { ['']: {b: { c: { d: expected }}}};
        }
        expect(getParamValue(new Target(), paramDefn)).toBe(expected);
    });

});
