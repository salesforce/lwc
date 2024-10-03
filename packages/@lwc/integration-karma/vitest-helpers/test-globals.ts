import * as lwc from 'lwc';
import { vi } from 'vitest';
import { LWC_VERSION } from '@lwc/shared';
import * as testHydrate from 'test-hydrate';
vi.stubGlobal('LWC', { ...lwc });
vi.stubGlobal('HydrateTest', testHydrate);
vi.stubGlobal('process', {
    env: {
        NATIVE_SHADOW: true,
        LWC_VERSION,
    },
});

lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE = true;

export function spyOn(obj: any, methodName: string) {
    const spy = vi.spyOn(obj, methodName);

    Object.defineProperty(spy, 'and', {
        value: {
            returnValue(value: any) {
                return spy.mockReturnValue(value);
            },
            callFake(fn: any) {
                return spy.mockImplementation(fn);
            },
            callThrough() {
                return spy.mockClear();
            },
        },
    });

    Object.defineProperty(spy, 'calls', {
        value: {
            allArgs() {
                return spy.mock.calls;
            },
            mostRecent() {
                return {
                    args: spy.mock.lastCall,
                };
            },
            count() {
                return spy.mock.calls.length;
            },
            argsFor(index: number) {
                return spy.mock.calls[index];
            },
            reset() {
                return spy.mockClear();
            },
        },
    });

    return spy;
}

vi.stubGlobal('spyOn', spyOn);

export function createSpy() {
    const spy = vi.fn();

    Object.defineProperty(spy, 'calls', {
        value: {
            allArgs() {
                return spy.mock.calls;
            },
            count() {
                return spy.mock.calls.length;
            },
            reset() {
                return spy.mockClear();
            },
        },
    });

    return spy;
}

vi.stubGlobal('jasmine', {
    createSpy,
    any: (constructor: unknown) => expect.any(constructor),
    objectContaining: <T = any>(o: T) => expect.objectContaining(o),
    arrayWithExactContents: <T = unknown>(expected: Array<T>) => expect.arrayContaining(expected),
});

vi.stubGlobal('xit', it.skip);
vi.stubGlobal('xdescribe', describe.skip);

declare global {
    var LWC: typeof lwc;
    var spyOn: typeof vi.spyOn;
    var xit: typeof it.skip;
    var xdescribe: typeof describe.skip;
    var jasmine: {
        createSpy: typeof createSpy;
        any: typeof expect.any;
        objectContaining: typeof expect.objectContaining;
        arrayWithExactContents: typeof expect.arrayContaining;
    };

    interface Window {
        __lwcResetWarnedOnVersionMismatch: () => void;
        __lwcResetGlobalStylesheets: () => void;
        __lwcResetAlreadyLoggedMessages: () => void;
    }
}
