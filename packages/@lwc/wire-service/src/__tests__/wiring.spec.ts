/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as target from '../wiring';
import { ValueChangedEvent } from '../value-changed-event';
import {
    CONTEXT_ID,
    CONTEXT_CONNECTED,
    CONNECT,
    CONTEXT_DISCONNECTED,
    DISCONNECT,
    CONTEXT_UPDATED,
    CONFIG,
} from '../constants';
import { LightningElement, ElementDef, WireDef } from '../engine';
import * as dependency from '../property-trap';

describe('WireEventTarget', () => {
    describe('addEventListener', () => {
        describe('connect event', () => {
            it('throws on duplicate listener', () => {
                function dupeListener() {
                    /**/
                }
                const mockContext = Object.create(null);
                mockContext[CONTEXT_ID] = Object.create(null);
                mockContext[CONTEXT_ID][CONTEXT_CONNECTED] = [dupeListener];
                const wireEventTarget = new target.WireEventTarget(
                    {} as LightningElement,
                    {} as ElementDef,
                    mockContext,
                    {} as WireDef,
                    'test'
                );
                expect(() => {
                    wireEventTarget.addEventListener(CONNECT, dupeListener);
                }).toThrowError('must not call addEventListener("connect") with the same listener');
            });

            it('adds listener to the queue', () => {
                function listener() {
                    /**/
                }
                const mockContext = Object.create(null);
                mockContext[CONTEXT_ID] = Object.create(null);
                mockContext[CONTEXT_ID][CONTEXT_CONNECTED] = [];
                const wireEventTarget = new target.WireEventTarget(
                    {} as LightningElement,
                    {} as ElementDef,
                    mockContext,
                    {} as WireDef,
                    'test'
                );
                wireEventTarget.addEventListener(CONNECT, listener);
                const actual = mockContext[CONTEXT_ID][CONTEXT_CONNECTED];
                expect(actual).toHaveLength(1);
                expect(actual[0]).toBe(listener);
            });
        });

        describe('disconnect event', () => {
            it('throws on duplicate listener', () => {
                function dupeListener() {
                    /**/
                }
                const mockContext = Object.create(null);
                mockContext[CONTEXT_ID] = Object.create(null);
                mockContext[CONTEXT_ID][CONTEXT_DISCONNECTED] = [dupeListener];
                const wireEventTarget = new target.WireEventTarget(
                    {} as LightningElement,
                    {} as ElementDef,
                    mockContext,
                    {} as WireDef,
                    'test'
                );
                expect(() => {
                    wireEventTarget.addEventListener(DISCONNECT, dupeListener);
                }).toThrowError(
                    'must not call addEventListener("disconnect") with the same listener'
                );
            });

            it('adds listener to the queue', () => {
                function listener() {
                    /**/
                }
                const mockContext = Object.create(null);
                mockContext[CONTEXT_ID] = Object.create(null);
                mockContext[CONTEXT_ID][CONTEXT_DISCONNECTED] = [];
                const wireEventTarget = new target.WireEventTarget(
                    {} as LightningElement,
                    {} as ElementDef,
                    mockContext,
                    {} as WireDef,
                    'test'
                );
                wireEventTarget.addEventListener(DISCONNECT, listener);
                const actual = mockContext[CONTEXT_ID][CONTEXT_DISCONNECTED];
                expect(actual).toHaveLength(1);
                expect(actual[0]).toBe(listener);
            });
        });

        describe('config event', () => {
            it('immediately fires when no static or dynamic parameters', () => {
                const listener = jest.fn();
                const mockWireDef: WireDef = {
                    adapter: {},
                };
                const wireEventTarget = new target.WireEventTarget(
                    {} as LightningElement,
                    {} as ElementDef,
                    {} as target.Context,
                    mockWireDef,
                    'test'
                );
                wireEventTarget.addEventListener(CONFIG, listener);
                expect(listener).toHaveBeenCalledTimes(1);
            });
            it('immediately fires when config is statics only', () => {
                const listener = jest.fn();
                const mockWireDef: WireDef = {
                    adapter: {},
                    params: {},
                    static: {
                        test: ['fixed', 'array'],
                    },
                };
                const wireEventTarget = new target.WireEventTarget(
                    {} as LightningElement,
                    {} as ElementDef,
                    {} as target.Context,
                    mockWireDef,
                    'test'
                );
                wireEventTarget.addEventListener(CONFIG, listener);
                expect(listener).toHaveBeenCalledTimes(1);
            });
            it('does not install traps or enqueue for default values when no dynamic parameters', () => {
                const mockWireDef: WireDef = {
                    adapter: {},
                    params: {},
                    static: {
                        test: ['fixed', 'array'],
                    },
                };
                const { installTrap, updated } = dependency;
                (dependency as any).installTrap = jest.fn();
                (dependency as any).updated = jest.fn();
                const wireEventTarget = new target.WireEventTarget(
                    {} as LightningElement,
                    {} as ElementDef,
                    {} as target.Context,
                    mockWireDef,
                    'test'
                );
                wireEventTarget.addEventListener(CONFIG, () => {
                    /**/
                });
                expect(dependency.installTrap).toHaveBeenCalledTimes(0);
                expect(dependency.updated).toHaveBeenCalledTimes(0);
                (dependency as any).installTrap = installTrap;
                (dependency as any).updated = updated;
            });
            it('enqueues for default values of dynamic parameters', () => {
                const wireContext = Object.create(null);
                wireContext[CONTEXT_UPDATED] = { listeners: {}, values: {} };
                const mockContext = Object.create(null);
                mockContext[CONTEXT_ID] = wireContext;
                const mockWireDef: WireDef = {
                    adapter: {},
                    params: {
                        key: 'prop',
                    },
                };
                const { updated } = dependency;
                (dependency as any).updated = jest.fn();
                const wireEventTarget = new target.WireEventTarget(
                    {} as LightningElement,
                    {} as ElementDef,
                    mockContext,
                    mockWireDef,
                    'test'
                );
                wireEventTarget.addEventListener(CONFIG, () => {
                    /**/
                });
                expect(dependency.updated).toHaveBeenCalledTimes(1);
                (dependency as any).updated = updated;
            });
            it('creates one trap per property for multiple listeners', () => {
                const wireContext = Object.create(null);
                wireContext[CONTEXT_UPDATED] = { listeners: {}, values: {} };
                const mockContext = Object.create(null);
                mockContext[CONTEXT_ID] = wireContext;
                const mockWireDef: WireDef = {
                    adapter: {},
                    params: {
                        key: 'prop',
                    },
                };
                const { installTrap } = dependency;
                (dependency as any).installTrap = jest.fn();
                const wireEventTarget = new target.WireEventTarget(
                    {} as LightningElement,
                    {} as ElementDef,
                    mockContext,
                    mockWireDef,
                    'test'
                );
                wireEventTarget.addEventListener(CONFIG, () => {
                    /**/
                });
                expect(dependency.installTrap).toHaveBeenCalled();
                const wireEventTarget1 = new target.WireEventTarget(
                    {} as LightningElement,
                    {} as ElementDef,
                    mockContext,
                    mockWireDef,
                    'test1'
                );
                wireEventTarget1.addEventListener(CONFIG, () => {
                    /**/
                });
                expect(dependency.installTrap).toHaveBeenCalledTimes(1);
                (dependency as any).installTrap = installTrap;
            });
            it('creates one trap for root property for multiple listeners to dot-notation parameters', () => {
                const wireContext = Object.create(null);
                wireContext[CONTEXT_UPDATED] = { listeners: {}, values: {} };
                const mockContext = Object.create(null);
                mockContext[CONTEXT_ID] = wireContext;
                const mockWireDef: WireDef = {
                    adapter: {},
                    params: {
                        key: 'a.b.c.d',
                        other: 'a.x.y',
                    },
                };
                const { installTrap } = dependency;
                (dependency as any).installTrap = jest.fn();
                const wireEventTarget = new target.WireEventTarget(
                    {} as LightningElement,
                    {} as ElementDef,
                    mockContext,
                    mockWireDef,
                    'test'
                );
                wireEventTarget.addEventListener(CONFIG, () => {
                    /**/
                });
                expect(dependency.installTrap).toHaveBeenCalledTimes(1);
                const wireEventTarget1 = new target.WireEventTarget(
                    {} as LightningElement,
                    {} as ElementDef,
                    mockContext,
                    mockWireDef,
                    'test1'
                );
                wireEventTarget1.addEventListener(CONFIG, () => {
                    /**/
                });
                expect(dependency.installTrap).toHaveBeenCalledTimes(1);
                (dependency as any).installTrap = installTrap;
            });
            it('creates one trap per property per component', () => {
                const wireContext1 = Object.create(null);
                wireContext1[CONTEXT_UPDATED] = { listeners: {}, values: {} };
                const mockContext1 = Object.create(null);
                mockContext1[CONTEXT_ID] = wireContext1;

                const wireContext2 = Object.create(null);
                wireContext2[CONTEXT_UPDATED] = { listeners: {}, values: {} };
                const mockContext2 = Object.create(null);
                mockContext2[CONTEXT_ID] = wireContext2;

                const mockWireDef: WireDef = {
                    adapter: {},
                    params: {
                        key: 'prop',
                    },
                };

                const { installTrap } = dependency;
                (dependency as any).installTrap = jest.fn();
                const wireEventTarget = new target.WireEventTarget(
                    {} as LightningElement,
                    {} as ElementDef,
                    mockContext1,
                    mockWireDef,
                    'test'
                );
                wireEventTarget.addEventListener(CONFIG, () => {
                    /**/
                });
                expect(dependency.installTrap).toHaveBeenCalled();
                const wireEventTarget1 = new target.WireEventTarget(
                    {} as LightningElement,
                    {} as ElementDef,
                    mockContext2,
                    mockWireDef,
                    'test'
                );
                wireEventTarget1.addEventListener(CONFIG, () => {
                    /**/
                });
                expect(dependency.installTrap).toHaveBeenCalledTimes(2);
                (dependency as any).installTrap = installTrap;
            });
        });

        it('throws when event type is not supported', () => {
            const wireEventTarget = new target.WireEventTarget(
                {} as LightningElement,
                {} as ElementDef,
                {} as target.Context,
                {} as WireDef,
                'test'
            );
            expect(() => {
                wireEventTarget.addEventListener('test', () => {
                    /**/
                });
            }).toThrowError('unsupported event type test');
        });
    });

    describe('removeEventListener', () => {
        it('removes listener from the queue for connect event', () => {
            function listener() {
                /**/
            }
            const mockContext = Object.create(null);
            mockContext[CONTEXT_ID] = Object.create(null);
            mockContext[CONTEXT_ID][CONTEXT_CONNECTED] = [listener];
            const wireEventTarget = new target.WireEventTarget(
                {} as LightningElement,
                {} as ElementDef,
                mockContext,
                {} as WireDef,
                'test'
            );
            wireEventTarget.removeEventListener(CONNECT, listener);
            expect(mockContext[CONTEXT_ID][CONTEXT_CONNECTED]).toHaveLength(0);
        });
        it('removes listener from the queue for disconnect event', () => {
            function listener() {
                /**/
            }
            const mockContext = Object.create(null);
            mockContext[CONTEXT_ID] = Object.create(null);
            mockContext[CONTEXT_ID][CONTEXT_DISCONNECTED] = [listener];
            const wireEventTarget = new target.WireEventTarget(
                {} as LightningElement,
                {} as ElementDef,
                mockContext,
                {} as WireDef,
                'test'
            );
            wireEventTarget.removeEventListener(DISCONNECT, listener);
            expect(mockContext[CONTEXT_ID][CONTEXT_DISCONNECTED]).toHaveLength(0);
        });
        it('removes listenerMetadata from the queue for config event for non-dot-notation reactive parameter', () => {
            function listener() {
                /**/
            }
            const mockConfigListenerMetadata = { listener };
            const mockContext = Object.create(null);
            mockContext[CONTEXT_ID] = Object.create(null);
            mockContext[CONTEXT_ID][CONTEXT_UPDATED] = {
                listeners: { prop: [mockConfigListenerMetadata] },
            };
            const mockWireDef: WireDef = {
                adapter: {},
                params: {
                    test: 'prop',
                },
            };
            const wireEventTarget = new target.WireEventTarget(
                {} as LightningElement,
                {} as ElementDef,
                mockContext,
                mockWireDef,
                'test'
            );
            wireEventTarget.removeEventListener(CONFIG, listener);
            expect(mockContext[CONTEXT_ID][CONTEXT_UPDATED].listeners.prop).toHaveLength(0);
        });
        it('removes listenerMetadata from the queue for config event for dot-notation reactive parameter', () => {
            function listener() {
                /**/
            }
            const mockConfigListenerMetadata = { listener };
            const mockContext = Object.create(null);
            mockContext[CONTEXT_ID] = Object.create(null);
            mockContext[CONTEXT_ID][CONTEXT_UPDATED] = {
                listeners: { x: [mockConfigListenerMetadata] },
            };
            const mockWireDef: WireDef = {
                adapter: {},
                params: {
                    test: 'x.y.z',
                },
            };
            const wireEventTarget = new target.WireEventTarget(
                {} as LightningElement,
                {} as ElementDef,
                mockContext,
                mockWireDef,
                'test'
            );
            wireEventTarget.removeEventListener(CONFIG, listener);
            expect(mockContext[CONTEXT_ID][CONTEXT_UPDATED].listeners.x).toHaveLength(0);
        });
        it('throws when event type is not supported', () => {
            const wireEventTarget = new target.WireEventTarget(
                {} as LightningElement,
                {} as ElementDef,
                {} as target.Context,
                {} as WireDef,
                'test'
            );
            expect(() => {
                wireEventTarget.removeEventListener('test', () => {
                    /**/
                });
            }).toThrowError('unsupported event type test');
        });
    });

    describe('dispatchEvent', () => {
        it('updates wired property when ValueChangeEvent received', () => {
            const mockCmp = {
                test: undefined,
            };
            const wireEventTarget = new target.WireEventTarget(
                mockCmp as any,
                {} as ElementDef,
                {} as target.Context,
                {} as WireDef,
                'test'
            );
            wireEventTarget.dispatchEvent(new ValueChangedEvent('value'));
            expect(mockCmp.test).toBe('value');
        });
        it('invokes wired method when ValueChangedEvent received', () => {
            let actual;
            const mockCmp = {
                test: value => {
                    actual = value;
                },
            };
            const wireEventTarget = new target.WireEventTarget(
                mockCmp as any,
                {} as ElementDef,
                {} as target.Context,
                { method: 1 } as WireDef,
                'test'
            );
            wireEventTarget.dispatchEvent(new ValueChangedEvent('value'));
            expect(actual).toBe('value');
        });
        it('throws on non-ValueChangedEvent', () => {
            const test = {};
            test.toString = () => 'test';
            const wireEventTarget = new target.WireEventTarget(
                {} as LightningElement,
                {} as ElementDef,
                {} as target.Context,
                {} as WireDef,
                'test'
            );
            expect(() => {
                wireEventTarget.dispatchEvent(test as ValueChangedEvent);
            }).toThrowError('Invalid event test.');
        });
    });
});
