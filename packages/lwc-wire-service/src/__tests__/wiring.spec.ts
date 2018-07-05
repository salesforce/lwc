import * as target from '../wiring';
import {
    CONTEXT_ID,
    CONTEXT_CONNECTED,
    CONNECT,
    CONTEXT_DISCONNECTED,
    DISCONNECT,
    CONTEXT_UPDATED,
    CONFIG
} from '../constants';
import {
    Element,
    ElementDef,
    WireDef
} from '../engine';
import * as dependency from '../property-trap';

describe('WireEventTarget', () => {
    describe('addEventListener', () => {
        describe('connect event', () => {
            it('throws on duplicate listener', () => {
                function dupeListener() { /**/ }
                const mockContext = Object.create(null);
                mockContext[CONTEXT_ID] = Object.create(null);
                mockContext[CONTEXT_ID][CONTEXT_CONNECTED] = [dupeListener];
                const wireEventTarget = new target.WireEventTarget({} as Element, {} as ElementDef, mockContext, {} as WireDef, "test");
                expect(() => { wireEventTarget.addEventListener(CONNECT, dupeListener); })
                    .toThrowError('must not call addEventListener("connect") with the same listener');
            });

            it('adds listener to the queue', () => {
                function listener() { /**/ }
                const mockContext = Object.create(null);
                mockContext[CONTEXT_ID] = Object.create(null);
                mockContext[CONTEXT_ID][CONTEXT_CONNECTED] = [];
                const wireEventTarget = new target.WireEventTarget({} as Element, {} as ElementDef, mockContext, {} as WireDef, "test");
                wireEventTarget.addEventListener(CONNECT, listener);
                const actual = mockContext[CONTEXT_ID][CONTEXT_CONNECTED];
                expect(actual).toHaveLength(1);
                expect(actual[0]).toBe(listener);
            });
        });

        describe('disconnect event', () => {
            it('throws on duplicate listener', () => {
                function dupeListener() { /**/ }
                const mockContext = Object.create(null);
                mockContext[CONTEXT_ID] = Object.create(null);
                mockContext[CONTEXT_ID][CONTEXT_DISCONNECTED] = [dupeListener];
                const wireEventTarget = new target.WireEventTarget({} as Element, {} as ElementDef, mockContext, {} as WireDef, "test");
                expect(() => { wireEventTarget.addEventListener(DISCONNECT, dupeListener); })
                    .toThrowError('must not call addEventListener("disconnect") with the same listener');
            });

            it('adds listener to the queue', () => {
                function listener() { /**/ }
                const mockContext = Object.create(null);
                mockContext[CONTEXT_ID] = Object.create(null);
                mockContext[CONTEXT_ID][CONTEXT_DISCONNECTED] = [];
                const wireEventTarget = new target.WireEventTarget({} as Element, {} as ElementDef, mockContext, {} as WireDef, "test");
                wireEventTarget.addEventListener(DISCONNECT, listener);
                const actual = mockContext[CONTEXT_ID][CONTEXT_DISCONNECTED];
                expect(actual).toHaveLength(1);
                expect(actual[0]).toBe(listener);
            });
        });

        describe('config event', () => {
            it('immediately fires when no static or dynamic config', () => {
                const listener = jest.fn();
                const mockWireDef: WireDef = {
                    adapter: {}
                };
                const wireEventTarget = new target.WireEventTarget({} as Element, {} as ElementDef, {} as target.Context, mockWireDef, "test");
                wireEventTarget.addEventListener(CONFIG, listener);
                expect(listener).toHaveBeenCalledTimes(1);
            });
            it('immediately fires when config is statics only', () => {
                const listener = jest.fn();
                const mockWireDef: WireDef = {
                    adapter: {},
                    params: {},
                    static: {
                        test: ["fixed", 'array']
                    }
                };
                const wireEventTarget = new target.WireEventTarget({} as Element, {} as ElementDef, {} as target.Context, mockWireDef, "test");
                wireEventTarget.addEventListener(CONFIG, listener);
                expect(listener).toHaveBeenCalledTimes(1);
            });
            it('multiple listeners from one adapter creates only one trap per property', () => {
                const wireContext = Object.create(null);
                wireContext[CONTEXT_UPDATED] = { listeners: {}, values: {} };
                const mockContext = Object.create(null);
                mockContext[CONTEXT_ID] = wireContext;
                const mockWireDef: WireDef = {
                    adapter: {},
                    params: {
                        key: "prop"
                    }
                };
                const mockInstallTrap = jest.fn();
                const originalInstallTrap = dependency.installTrap;
                (dependency as any).installTrap = mockInstallTrap;
                const wireEventTarget = new target.WireEventTarget({} as Element, {} as ElementDef, mockContext, mockWireDef, "test");
                wireEventTarget.addEventListener(CONFIG, () => { /**/ });
                expect(mockInstallTrap).toHaveBeenCalled();
                const wireEventTarget1 = new target.WireEventTarget({} as Element, {} as ElementDef, mockContext, mockWireDef, "test1");
                wireEventTarget1.addEventListener(CONFIG, () => { /**/ });
                expect(mockInstallTrap).toHaveBeenCalledTimes(1);
                (dependency as any).installTrap = originalInstallTrap;
            });
            it('multiple components from one adapter create multiple traps', () => {
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
                        key: "prop"
                    }
                };

                const mockInstallTrap = jest.fn();
                const originalInstallTrap = dependency.installTrap;
                (dependency as any).installTrap = mockInstallTrap;
                const wireEventTarget = new target.WireEventTarget({} as Element, {} as ElementDef, mockContext1, mockWireDef, "test");
                wireEventTarget.addEventListener(CONFIG, () => { /**/ });
                expect(mockInstallTrap).toHaveBeenCalled();
                const wireEventTarget1 = new target.WireEventTarget({} as Element, {} as ElementDef, mockContext2, mockWireDef, "test");
                wireEventTarget1.addEventListener(CONFIG, () => { /**/ });
                expect(mockInstallTrap).toHaveBeenCalledTimes(2);
                (dependency as any).installTrap = originalInstallTrap;
            });
        });

        it('throws when event type is not supported', () => {
            const wireEventTarget = new target.WireEventTarget({} as Element, {} as ElementDef, {} as target.Context, {} as WireDef, "test");
            expect(() => { wireEventTarget.addEventListener('test', () => { /**/ }); })
                .toThrowError('unsupported event type test');
        });
    });

    describe('removeEventListener', () => {
        it('remove listener from the queue for connect event', () => {
            function listener() { /**/ }
            const mockContext = Object.create(null);
            mockContext[CONTEXT_ID] = Object.create(null);
            mockContext[CONTEXT_ID][CONTEXT_CONNECTED] = [listener];
            const wireEventTarget = new target.WireEventTarget({} as Element, {} as ElementDef, mockContext, {} as WireDef, "test");
            wireEventTarget.removeEventListener(CONNECT, listener);
            expect(mockContext[CONTEXT_ID][CONTEXT_CONNECTED]).toHaveLength(0);
        });
        it('remove listener from the queue for disconnect event', () => {
            function listener() { /**/ }
            const mockContext = Object.create(null);
            mockContext[CONTEXT_ID] = Object.create(null);
            mockContext[CONTEXT_ID][CONTEXT_DISCONNECTED] = [listener];
            const wireEventTarget = new target.WireEventTarget({} as Element, {} as ElementDef, mockContext, {} as WireDef, "test");
            wireEventTarget.removeEventListener(DISCONNECT, listener);
            expect(mockContext[CONTEXT_ID][CONTEXT_DISCONNECTED]).toHaveLength(0);
        });
        it('remove listenerMetadata from the queue for config event', () => {
            function listener() { /**/ }
            const mockConfigListenerMetadata = { listener };
            const mockContext = Object.create(null);
            mockContext[CONTEXT_ID] = Object.create(null);
            mockContext[CONTEXT_ID][CONTEXT_UPDATED] = { listeners: { test: [mockConfigListenerMetadata] } };
            const mockWireDef: WireDef = {
                adapter: {},
                params: {
                    test: 'test'
                }
            };
            const wireEventTarget = new target.WireEventTarget({} as Element, {} as ElementDef, mockContext, mockWireDef, "test");
            wireEventTarget.removeEventListener(CONFIG, listener);
            expect(mockContext[CONTEXT_ID][CONTEXT_UPDATED].listeners.test).toHaveLength(0);
        });
        it('throws when event type is not supported', () => {
            const wireEventTarget = new target.WireEventTarget({} as Element, {} as ElementDef, {} as target.Context, {} as WireDef, "test");
            expect(() => { wireEventTarget.removeEventListener('test', () => { /**/ }); })
                .toThrowError('unsupported event type test');
        });
    });

    describe('dispatchEvent', () => {
        it('ValueChangedEvent updates wired property', () => {
            const mockCmp = {
                test: undefined
            };
            const wireEventTarget = new target.WireEventTarget(mockCmp as any, {} as ElementDef, {} as target.Context, {} as WireDef, "test");
            wireEventTarget.dispatchEvent(new target.ValueChangedEvent('value'));
            expect(mockCmp.test).toBe('value');
        });
        it('ValueChangedEvent invokes wired method', () => {
            let actual;
            const mockCmp = {
                test: (value) => { actual = value; }
            };
            const wireEventTarget = new target.WireEventTarget(mockCmp as any, {} as ElementDef, {} as target.Context, { method: 1 } as WireDef, "test");
            wireEventTarget.dispatchEvent(new target.ValueChangedEvent('value'));
            expect(actual).toBe('value');
        });
        it('throws on non-ValueChangedEvent', () => {
            const test = {};
            test.toString = () => 'test';
            const wireEventTarget = new target.WireEventTarget({} as Element, {} as ElementDef, {} as target.Context, {} as WireDef, "test");
            expect(() => { wireEventTarget.dispatchEvent(test as target.ValueChangedEvent); })
                .toThrowError('Invalid event test.');
        });
    });
});
