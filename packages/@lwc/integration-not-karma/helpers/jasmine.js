import { spyOn, fn } from '@vitest/spy';

/**
 * Adds the jasmine interfaces we use in the Karma tests to a Vitest spy.
 * Should ultimately be removed and tests updated to use Vitest spies.
 * @param {import('@vitest/spy').MockInstance}
 */
function jasmineSpyAdapter(spy) {
    Object.defineProperties(spy, {
        calls: { get: () => spy.mock.calls },
    });

    Object.defineProperties(spy.mock.calls, {
        // Must be non-enumerable for equality checks to work on array literal expected values
        count: { value: () => spy.mock.calls.length },
        reset: { value: () => spy.mockReset() },
        argsFor: { value: (index) => spy.mock.calls.at(index) },
    });

    return spy;
}

export const jasmineSpyOn = (object, prop) => jasmineSpyAdapter(spyOn(object, prop));
export const jasmine = {
    any: expect.any,
    arrayWithExactContents: () => {
        throw new Error('TODO: jasmine.arrayWithExactContents');
    },
    createSpy: (name, impl) => jasmineSpyAdapter(fn(impl)),
    objectContaining: expect.objectContaining,
};
