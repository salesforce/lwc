import {
    WIRE_CONTEXT_ID,
    CONTEXT_CONNECTED,
    CONNECT,
    CONTEXT_DISCONNECTED,
    DISCONNECT,
    CONTEXT_UPDATED,
    CONFIG,
    WireDef,
    WireEventTarget,
    ValueChangedEvent
} from '../wiring';
import { VM } from '../vm';
import { Context } from "../context";

describe('WireEventTarget', () => {
    describe('addEventListener', () => {
        describe('connect event', () => {
            it('throws on duplicate listener', () => {
                function dupeListener() { /**/ }
                const mockContext = Object.create(null);
                mockContext[WIRE_CONTEXT_ID] = Object.create(null);
                mockContext[WIRE_CONTEXT_ID][CONTEXT_CONNECTED] = [dupeListener];
                const wireEventTarget = new WireEventTarget({} as VM, mockContext, {} as WireDef, "test");
                expect(() => { wireEventTarget.addEventListener(CONNECT, dupeListener); })
                    .toThrowError('must not call addEventListener("connect") with the same listener');
            });

            it('adds listener to the queue', () => {
                function listener() { /**/ }
                const mockContext = Object.create(null);
                mockContext[WIRE_CONTEXT_ID] = Object.create(null);
                mockContext[WIRE_CONTEXT_ID][CONTEXT_CONNECTED] = [];
                const wireEventTarget = new WireEventTarget({} as VM, mockContext, {} as WireDef, "test");
                wireEventTarget.addEventListener(CONNECT, listener);
                const actual = mockContext[WIRE_CONTEXT_ID][CONTEXT_CONNECTED];
                expect(actual).toHaveLength(1);
                expect(actual[0]).toBe(listener);
            });
        });

        describe('disconnect event', () => {
            it('throws on duplicate listener', () => {
                function dupeListener() { /**/ }
                const mockContext = Object.create(null);
                mockContext[WIRE_CONTEXT_ID] = Object.create(null);
                mockContext[WIRE_CONTEXT_ID][CONTEXT_DISCONNECTED] = [dupeListener];
                const wireEventTarget = new WireEventTarget({} as VM, mockContext, {} as WireDef, "test");
                expect(() => { wireEventTarget.addEventListener(DISCONNECT, dupeListener); })
                    .toThrowError('must not call addEventListener("disconnect") with the same listener');
            });

            it('adds listener to the queue', () => {
                function listener() { /**/ }
                const mockContext = Object.create(null);
                mockContext[WIRE_CONTEXT_ID] = Object.create(null);
                mockContext[WIRE_CONTEXT_ID][CONTEXT_DISCONNECTED] = [];
                const wireEventTarget = new WireEventTarget({} as VM, mockContext, {} as WireDef, "test");
                wireEventTarget.addEventListener(DISCONNECT, listener);
                const actual = mockContext[WIRE_CONTEXT_ID][CONTEXT_DISCONNECTED];
                expect(actual).toHaveLength(1);
                expect(actual[0]).toBe(listener);
            });
        });

        describe('config event', () => {
            it('immediately fires when config is statics only', () => {
                const listener = jest.fn();
                const mockWireDef = {
                    params: {},
                    static: {
                        test: ["fixed", 'array']
                    }
                };
                const wireEventTarget = new WireEventTarget({} as VM, {} as Context, mockWireDef as any, "test");
                wireEventTarget.addEventListener(CONFIG, listener);
                expect(listener).toHaveBeenCalledTimes(1);
            });
        });

        it('throws when event type is not supported', () => {
            const wireEventTarget = new WireEventTarget({} as VM, {} as Context, {} as WireDef, "test");
            expect(() => { wireEventTarget.addEventListener('test', () => { /**/ }); })
                .toThrowError('unsupported event type test');
        });
    });

    describe('removeEventListener', () => {
        it('remove listener from the queue for connect event', () => {
            function listener() { /**/ }
            const mockContext = Object.create(null);
            mockContext[WIRE_CONTEXT_ID] = Object.create(null);
            mockContext[WIRE_CONTEXT_ID][CONTEXT_CONNECTED] = [listener];
            const wireEventTarget = new WireEventTarget({} as VM, mockContext, {} as WireDef, "test");
            wireEventTarget.removeEventListener(CONNECT, listener);
            expect(mockContext[WIRE_CONTEXT_ID][CONTEXT_CONNECTED]).toHaveLength(0);
        });
        it('remove listener from the queue for disconnect event', () => {
            function listener() { /**/ }
            const mockContext = Object.create(null);
            mockContext[WIRE_CONTEXT_ID] = Object.create(null);
            mockContext[WIRE_CONTEXT_ID][CONTEXT_DISCONNECTED] = [listener];
            const wireEventTarget = new WireEventTarget({} as VM, mockContext, {} as WireDef, "test");
            wireEventTarget.removeEventListener(DISCONNECT, listener);
            expect(mockContext[WIRE_CONTEXT_ID][CONTEXT_DISCONNECTED]).toHaveLength(0);
        });
        it('remove listenerMetadata from the queue for config event', () => {
            function listener() { /**/ }
            const mockConfigListenerMetadata = { listener };
            const mockContext = Object.create(null);
            mockContext[WIRE_CONTEXT_ID] = Object.create(null);
            mockContext[WIRE_CONTEXT_ID][CONTEXT_UPDATED] = { listeners: { test: [mockConfigListenerMetadata] } };
            const mockWireDef = Object.create(null);
            mockWireDef.params = {test: 'test'};
            const wireEventTarget = new WireEventTarget({} as VM, mockContext, mockWireDef, "test");
            wireEventTarget.removeEventListener(CONFIG, listener);
            expect(mockContext[WIRE_CONTEXT_ID][CONTEXT_UPDATED].listeners.test).toHaveLength(0);
        });
        it('throws when event type is not supported', () => {
            const wireEventTarget = new WireEventTarget({} as VM, {} as Context, {} as WireDef, "test");
            expect(() => { wireEventTarget.removeEventListener('test', () => { /**/ }); })
                .toThrowError('unsupported event type test');
        });
    });

    describe('dispatchEvent', () => {
        it('ValueChangedEvent updates wired property', () => {
            const mockCmp = {
                test: undefined
            };

            const mockVM = {
                component: mockCmp,
                wireValues: {}
            };

            const key = "test";
            const wireEventTarget = new WireEventTarget(mockVM as any, {} as Context, {} as WireDef, key);
            wireEventTarget.dispatchEvent(new ValueChangedEvent('value'));
            expect(mockVM.wireValues[key]).toBe('value');
        });
        it('ValueChangedEvent invokes wired method', () => {
            let actual;
            const mockCmp = {
                test: (value) => { actual = value; }
            };
            const mockVM = {
                component: mockCmp
            };
            const wireEventTarget = new WireEventTarget(mockVM as any, {} as Context, { method: true } as any, "test");
            wireEventTarget.dispatchEvent(new ValueChangedEvent('value'));
            expect(actual).toBe('value');
        });
        it('throws on non-ValueChangedEvent', () => {
            const test = {};
            test.toString = () => 'test';
            const wireEventTarget = new WireEventTarget({} as VM, {} as Context, {} as WireDef, "test");
            expect(() => { wireEventTarget.dispatchEvent(test as ValueChangedEvent); })
                .toThrowError('Invalid event test.');
        });
    });
});
