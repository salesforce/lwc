import * as lwc from 'lwc';
import { vi } from 'vitest';

vi.stubGlobal('LWC', { ...lwc });

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
                return spy.mockRestore();
            },
        },
    });

    Object.defineProperty(spy, 'calls', {
        value: {
            allArgs() {
                return spy.mock.calls;
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
            reset() {
                return spy.mockClear();
            },
        },
    });

    return spy;
}

vi.stubGlobal('jasmine', {
    createSpy,
    any: expect.any,
    objectContaining: expect.objectContaining,
    arrayWithExactContents: expect.arrayContaining,
});

vi.stubGlobal('xit', it.skip);

declare global {
    var LWC: typeof lwc;
    var spyOn: typeof vi.spyOn;
    var xit: typeof it.skip;
    var jasmine: {
        createSpy: typeof createSpy;
        any: typeof expect.any;
        objectContaining: typeof expect.objectContaining;
        arrayWithExactContents: typeof expect.arrayContaining;
    };

    interface Window {
        __lwcResetGlobalStylesheets: () => void;
        __lwcResetAlreadyLoggedMessages: () => void;
    }
}
