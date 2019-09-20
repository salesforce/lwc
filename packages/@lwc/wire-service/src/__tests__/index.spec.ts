/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { register, WireEventTarget, ValueChangedEvent } from '../index';

describe('WireEventTarget from register', () => {
    describe('connected', () => {
        it('should invoke connected listeners', () => {
            const adapterId = {};
            let wireEventTarget: WireEventTarget;
            const adapterFactory = (wireEvtTarget: WireEventTarget) =>
                (wireEventTarget = wireEvtTarget);

            register(adapterId, adapterFactory);
            const adapter = new adapterId.adapter();

            const listener1 = jest.fn();
            const listener2 = jest.fn();
            wireEventTarget!.addEventListener('connect', listener1);
            wireEventTarget!.addEventListener('connect', listener2);

            adapter.connect();
            expect(listener1).toHaveBeenCalledTimes(1);
            expect(listener2).toHaveBeenCalledTimes(1);
        });
    });

    describe('disconnected', () => {
        it('should invoke disconnected listeners', () => {
            const adapterId = {};
            let wireEventTarget: WireEventTarget;
            const dataCallback = jest.fn();
            const adapterFactory = (wireEvtTarget: WireEventTarget) =>
                (wireEventTarget = wireEvtTarget);

            register(adapterId, adapterFactory);
            const adapter = new adapterId.adapter(dataCallback);

            const listener1 = jest.fn();
            const listener2 = jest.fn();
            wireEventTarget!.addEventListener('disconnect', listener1);
            wireEventTarget!.addEventListener('disconnect', listener2);

            adapter.disconnect();
            expect(listener1).toHaveBeenCalledTimes(1);
            expect(listener2).toHaveBeenCalledTimes(1);
        });
    });

    describe('config', () => {
        it('should invoke config listeners', () => {
            const adapterId = {};
            let wireEventTarget: WireEventTarget;
            const dataCallback = jest.fn();
            const adapterFactory = (wireEvtTarget: WireEventTarget) =>
                (wireEventTarget = wireEvtTarget);

            register(adapterId, adapterFactory);
            const adapter = new adapterId.adapter(dataCallback);

            const listener1 = jest.fn();
            const listener2 = jest.fn();
            wireEventTarget!.addEventListener('config', listener1);
            wireEventTarget!.addEventListener('config', listener2);

            const config = {};
            adapter.update(config);
            expect(listener1).toHaveBeenCalledTimes(1);
            expect(listener1.mock.calls[0][0]).toBe(config);

            expect(listener2).toHaveBeenCalledTimes(1);
            expect(listener2.mock.calls[0][0]).toBe(config);
        });

        it('should immediately fires CONFIG when there is a config ready in the adapter instance', () => {
            const adapterId = {};
            let wireEventTarget: WireEventTarget;
            const adapterFactory = (wireEvtTarget: WireEventTarget) =>
                (wireEventTarget = wireEvtTarget);

            register(adapterId, adapterFactory);
            const adapter = new adapterId.adapter(jest.fn());
            const expectedConfig = {};

            adapter.update(expectedConfig);

            const listener = jest.fn();
            wireEventTarget!.addEventListener('config', listener);
            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener.mock.calls[0][0]).toBe(expectedConfig);
        });

        it('should enqueue listener to be called when config is ready', () => {
            const adapterId = {};
            let wireEventTarget: WireEventTarget;
            const adapterFactory = (wireEvtTarget: WireEventTarget) =>
                (wireEventTarget = wireEvtTarget);

            register(adapterId, adapterFactory);
            const adapter = new adapterId.adapter(jest.fn());
            const listener = jest.fn();
            wireEventTarget!.addEventListener('config', listener);

            expect(listener).not.toBeCalled();

            const expectedConfig = {};
            adapter.update(expectedConfig);

            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener.mock.calls[0][0]).toBe(expectedConfig);
        });
    });

    describe('dispatchEvent', () => {
        it('should invoke data callback when dispatchEvent', () => {
            const adapterId = {};
            let wireEventTarget: WireEventTarget;
            const dataCallback = jest.fn();
            const adapterFactory = (wireEvtTarget: WireEventTarget) =>
                (wireEventTarget = wireEvtTarget);

            register(adapterId, adapterFactory);
            new adapterId.adapter(dataCallback);

            const expected = 'changed value';
            wireEventTarget!.dispatchEvent(new ValueChangedEvent(expected));

            expect(dataCallback).toHaveBeenCalledTimes(1);
            expect(dataCallback.mock.calls[0][0]).toBe(expected);
        });

        it('should throw on non-ValueChangedEvent', () => {
            const adapterId = {};
            let wireEventTarget: WireEventTarget;
            const dataCallback = jest.fn();
            const adapterFactory = (wireEvtTarget: WireEventTarget) =>
                (wireEventTarget = wireEvtTarget);

            register(adapterId, adapterFactory);
            new adapterId.adapter(dataCallback);

            expect(() => {
                const testEvent = 'test' as any;
                wireEventTarget.dispatchEvent(testEvent);
            }).toThrowError('Invalid event type undefined.');

            expect(() => {
                const testEvent = new CustomEvent('test') as any;
                wireEventTarget.dispatchEvent(testEvent as ValueChangedEvent);
            }).toThrowError('Invalid event type test.');
        });
    });

    describe('addEventListener', () => {
        it('should throw when adding unknown event listener type', () => {
            const adapterId = {};
            let wireEventTarget: WireEventTarget;
            const dataCallback = jest.fn();
            const adapterFactory = (wireEvtTarget: WireEventTarget) =>
                (wireEventTarget = wireEvtTarget);

            register(adapterId, adapterFactory);
            new adapterId.adapter(dataCallback);

            expect(() => {
                wireEventTarget!.addEventListener('invalidEventType', () => {});
            }).toThrow('Invalid event type invalidEventType.');
        });
    });

    describe('removeEventListener', () => {
        ['connect', 'disconnect', 'config'].forEach(eventType => {
            it(`should remove listener from the queue for ${eventType} event`, () => {
                const eventToAdapterMethod = {
                    connect: 'connect',
                    disconnect: 'disconnect',
                    config: 'update',
                };
                const adapterId = {};
                let wireEventTarget: WireEventTarget;
                const adapterFactory = (wireEvtTarget: WireEventTarget) =>
                    (wireEventTarget = wireEvtTarget);

                register(adapterId, adapterFactory);
                const adapter = new adapterId.adapter();

                const listener = jest.fn();
                wireEventTarget.addEventListener(eventType, listener);
                adapter[eventToAdapterMethod[eventType]]();

                expect(listener).toHaveBeenCalledTimes(1);

                wireEventTarget.removeEventListener(eventType, listener);
                adapter[eventToAdapterMethod[eventType]]();
                expect(listener).toHaveBeenCalledTimes(1);
            });
        });

        it('should throw when event type is not supported', () => {
            const adapterId = {};
            let wireEventTarget: WireEventTarget;
            const adapterFactory = (wireEvtTarget: WireEventTarget) =>
                (wireEventTarget = wireEvtTarget);

            register(adapterId, adapterFactory);
            new adapterId.adapter();

            expect(() => {
                const testEvent = 'test' as any;
                wireEventTarget.removeEventListener(testEvent, jest.fn());
            }).toThrowError('Invalid event type test.');
        });
    });

    it('should invoke adapter factory once per wire', () => {
        const adapterId = {};
        const dataCallback = jest.fn();
        const adapterFactory = jest.fn();

        register(adapterId, adapterFactory);
        new adapterId.adapter(dataCallback);
        new adapterId.adapter(dataCallback);

        expect(adapterFactory).toHaveBeenCalledTimes(2);
    });
});

describe('register', () => {
    // most common ids are functions and symbols so explicitly test those
    it('accepts function as adapter id', () => {
        function adapterId() {}
        function adapterFactory() {}
        register(adapterId, adapterFactory);
    });

    it('throws when adapter id is not truthy', () => {
        function adapterFactory() {}
        expect(() => register(undefined, adapterFactory)).toThrowError(
            'adapter id must be an object or a function'
        );
    });

    it('throws when adapter factory is not a function', () => {
        expect(() => register({}, {} as any)).toThrowError('adapter factory must be a callable');
    });

    it('should throw when adapter id is already associated to an adapter factory', () => {
        const adapterId = { adapter: {} };
        expect(() => register(adapterId, () => {})).toThrowError(
            'adapter id is already associated to an adapter factory'
        );
    });

    it('should freeze adapter property', () => {
        const adapterId = {};
        function adapterFactory() {}
        register(adapterId, adapterFactory);

        expect(() => {
            adapterId.adapter = 'modified';
        }).toThrow("Cannot assign to read only property 'adapter'");
    });

    it('should freeze adapter class', () => {
        const adapterId = {};
        function adapterFactory() {}
        register(adapterId, adapterFactory);

        expect(() => {
            adapterId.adapter.prototype.update = 'modified';
        }).toThrow('Cannot add property update, object is not extensible');

        expect(() => {
            adapterId.adapter.update = 'modified';
        }).toThrow('Cannot add property update, object is not extensible');
    });
});
