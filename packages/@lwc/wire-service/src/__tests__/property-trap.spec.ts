/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { installTrap, findDescriptor, getReactiveParameterValue, updated } from '../property-trap';
import { ConfigContext, ReactiveParameter } from '../wiring';

describe('findDescriptor', () => {
    it('detects circular prototype chains', () => {
        function A() {
            /**/
        }
        function B() {
            /**/
        }
        B.prototype = Object.create(A.prototype);
        A.prototype = Object.create(B.prototype);
        const actual = findDescriptor(B, 'target');
        expect(actual).toBe(null);
    });

    it('finds descriptor on super with prototype setting', () => {
        function A() {
            /**/
        }
        A.prototype.target = 'target';
        function B() {
            /**/
        }
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
            prop1: [],
        },
        values: {
            prop1: '',
        },
    };
    const reactiveParameter: ReactiveParameter = {
        reference: 'prop1',
        head: 'prop1',
    };

    it('defaults to original value when setter installed', () => {
        class Target {
            prop1 = 'initial';
        }
        const cmp = new Target();
        installTrap(cmp, reactiveParameter, context);
        expect(cmp.prop1).toBe('initial');
    });

    it('updates original property when installed setter invoked', () => {
        const expected = 'expected';
        class Target {
            prop1;
        }
        const cmp = new Target();
        installTrap(cmp, reactiveParameter, context);
        cmp.prop1 = expected;
        expect(cmp.prop1).toBe(expected);
    });

    it('installs setter on cmp for property', () => {
        class Target {
            set prop1(value) {
                /**/
            }
        }
        const original = Object.getOwnPropertyDescriptor(Target.prototype, 'prop1');
        const cmp = new Target();
        installTrap(cmp, reactiveParameter, context);
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
            get prop1() {
                return '';
            }
        }
        const cmp = new Target();
        installTrap(cmp, reactiveParameter, context);
        cmp.prop1 = expected;
        expect(setter).toHaveBeenCalledTimes(1);
        expect(setter).toHaveBeenCalledWith(expected);
    });

    it('installs setter on cmp only for reactiveParameter.root', () => {
        const dotNotationReactiveParameter: ReactiveParameter = {
            reference: 'prop1.x.y',
            head: 'prop1',
        };
        class Target {
            set prop1(value) {
                /**/
            }
        }
        const original = Object.getOwnPropertyDescriptor(Target.prototype, 'prop1');
        const cmp = new Target();
        installTrap(cmp, dotNotationReactiveParameter, context);
        const descriptor = Object.getOwnPropertyDescriptor(cmp, 'prop1');
        expect(descriptor!.set).not.toBe(original!.set);
        expect(Object.getOwnPropertyDescriptor(Target.prototype, 'prop1.x.y')).toBeUndefined();
    });
});

describe('invokeConfigListeners', () => {
    const reactiveParameter: ReactiveParameter = {
        reference: 'prop1',
        head: 'prop1',
    };

    it('invokes listener with reactive parameter default value', () => {
        const expected = 'expected';
        const listener = jest.fn();
        const context: ConfigContext = {
            listeners: {
                prop1: [{ listener, reactives: { param1: 'prop1' } }],
            },
            values: {
                // initial state is empty
            },
        };
        class Target {
            prop1 = expected;
        }
        const cmp = new Target();
        installTrap(cmp, reactiveParameter, context);
        updated(cmp, reactiveParameter, context);
        return Promise.resolve().then(() => {
            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener.mock.calls[0][0]).toEqual({ param1: expected });
        });
    });

    it('invokes listener with new value once', () => {
        const expected = 'expected';
        const listener = jest.fn();
        const context: ConfigContext = {
            listeners: {
                prop1: [{ listener, reactives: { param1: 'prop1' } }],
            },
            values: {},
        };
        class Target {
            prop1;
        }
        const cmp = new Target();
        installTrap(cmp, reactiveParameter, context);
        updated(cmp, reactiveParameter, context);
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
                prop1: [{ listener, reactives: { param1: 'prop1' } }],
            },
            values: {
                prop1: 'expected',
            },
        };
        class Target {
            prop1;
        }
        const cmp = new Target();
        installTrap(cmp, reactiveParameter, context);
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
                prop1: [{ listener, reactives: { param1: 'prop1' } }],
            },
            values: {
                prop1: '',
            },
        };
        class Target {
            set prop1(value) {
                /**/
            }
            get prop1() {
                return expected;
            }
        }
        const cmp = new Target();
        installTrap(cmp, reactiveParameter, context);
        cmp.prop1 = 'unexpected';
        return Promise.resolve().then(() => {
            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener.mock.calls[0][0]).toEqual({ param1: expected });
        });
    });
});

describe('getReactiveParameterValue', () => {
    it('returns leaf in object graph', () => {
        const expected = 'expected';
        const reactiveParameter: ReactiveParameter = {
            reference: 'a.b.c.d',
            head: 'a',
            tail: ['b', 'c', 'd'],
        };
        class Target {
            a = { b: { c: { d: expected } } };
        }
        expect(getReactiveParameterValue(new Target(), reactiveParameter)).toBe(expected);
    });

    it('returns tree in object graph', () => {
        const expected = { e: { f: 'expected' } };
        const reactiveParameter: ReactiveParameter = {
            reference: 'a.b.c.d',
            head: 'a',
            tail: ['b', 'c', 'd'],
        };
        class Target {
            a = { b: { c: { d: expected } } };
        }
        expect(getReactiveParameterValue(new Target(), reactiveParameter)).toBe(expected);
    });

    it('returns undefined if root is undefined', () => {
        const reactiveParameter: ReactiveParameter = {
            reference: 'a.b.c.d',
            head: 'a',
            tail: ['b', 'c', 'd'],
        };
        class Target {
            // a does not exist
        }
        expect(getReactiveParameterValue(new Target(), reactiveParameter)).toBeUndefined();
    });

    it('returns undefined if a segment is undefined', () => {
        const reactiveParameter: ReactiveParameter = {
            reference: 'a.b.c.d',
            head: 'a',
            tail: ['b', 'c', 'd'],
        };
        class Target {
            a = { b: undefined };
        }
        expect(getReactiveParameterValue(new Target(), reactiveParameter)).toBeUndefined();
    });

    it('returns undefined if a segment is not found', () => {
        const reactiveParameter: ReactiveParameter = {
            reference: 'a.b.c.d',
            head: 'a',
            tail: ['b', 'c', 'd'],
        };
        class Target {
            a = { b: {} };
        }
        expect(getReactiveParameterValue(new Target(), reactiveParameter)).toBeUndefined();
    });
});
