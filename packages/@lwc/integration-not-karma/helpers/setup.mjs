// This import ensures that the global `Mocha` object is present for mutation.
import { JestAsymmetricMatchers, JestChaiExpect, JestExtend } from '@vitest/expect';
import * as chai from 'chai';
import * as LWC from 'lwc';
import { spyOn, fn } from '@vitest/spy';
import { registerCustomMatchers } from './matchers/index.mjs';
import * as TestUtils from './utils.mjs';

// FIXME: As a relic of the Karma tests, some test files rely on the global object,
// rather than importing from `test-utils`.
window.TestUtils = TestUtils;

// allows using expect.extend instead of chai.use to extend plugins
chai.use(JestExtend);
// adds all jest matchers to expect
chai.use(JestChaiExpect);
// adds asymmetric matchers like stringContaining, objectContaining
chai.use(JestAsymmetricMatchers);
// add our custom matchers
chai.use(registerCustomMatchers);

/**
 * Adds the jasmine interfaces we use in the Karma tests to a Vitest spy.
 * Should ultimately be removed and tests updated to use Vitest spies.
 * @param {import('@vitest/spy').MockInstance}
 */
function jasmineSpyAdapter(spy) {
    Object.defineProperties(spy, {
        and: { get: () => spy },
        calls: { get: () => spy.mock.calls },
        returnValue: { value: () => spy.mockReturnValue() },
        // calling mockImplementation() with nothing restores the original
        callThrough: { value: () => spy.mockImplementation() },
        callFake: { value: (impl) => spy.mockImplementation(impl) },
    });

    Object.defineProperties(spy.mock.calls, {
        // Must be non-enumerable for equality checks to work on array literal expected values
        allArgs: { value: () => spy.mock.calls },
        count: { value: () => spy.mock.calls.length },
        reset: { value: () => spy.mockReset() },
        argsFor: { value: (index) => spy.mock.calls.at(index) },
    });

    return spy;
}

// expose so we don't need to import `expect` in every test file
globalThis.expect = chai.expect;
// Expose globals for karma compat
globalThis.LWC = LWC;
globalThis.spyOn = (object, prop) => jasmineSpyAdapter(spyOn(object, prop));
globalThis.jasmine = {
    any: expect.any,
    arrayWithExactContents: () => {
        throw new Error('TODO: jasmine.arrayWithExactContents');
    },
    createSpy: (name, impl) => jasmineSpyAdapter(fn(impl)),
    objectContaining: expect.objectContaining,
};

/**
 * `@web/test-runner-mocha`'s autorun.js file inlines its own copy of mocha, and there's no direct
 * way to modify the globals before the tests are executed. As a workaround, we predefine setters
 * that modify the provided values when they get set by the autorun script.
 * @param {string} name Global variable name
 * @param {Function} replacer Function that takes the original value and returns a modified one
 */
function hijackGlobal(name, replacer) {
    Object.defineProperty(globalThis, name, {
        configurable: true,
        enumerable: true,
        set(original) {
            Object.defineProperty(globalThis, name, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: replacer(original) ?? original,
            });
        },
    });
}

hijackGlobal('describe', (describe) => {
    describe.runIf = (condition) => (condition ? globalThis.describe : globalThis.xdescribe);
    describe.skipIf = (condition) => (condition ? globalThis.xdescribe : globalThis.describe);
});

hijackGlobal('it', (it) => {
    it.runIf = (condition) => (condition ? globalThis.it : globalThis.xit);
    it.skipIf = (condition) => (condition ? globalThis.xit : globalThis.it);
});

hijackGlobal('before', (before) => {
    // Expose as an alias for migration
    globalThis.beforeAll = before;
});

hijackGlobal('after', (after) => {
    // Expose as an alias for migration
    globalThis.afterAll = after;
});

hijackGlobal('afterEach', (afterEach) => {
    afterEach(() => {
        // Ensure the DOM is in a clean state
        document.body.replaceChildren();
    });
});
