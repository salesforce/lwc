// This import ensures that the global `Mocha` object is present for mutation.
import { JestAsymmetricMatchers, JestChaiExpect, JestExtend } from '@vitest/expect';
import * as chai from 'chai';
import * as LWC from 'lwc';
import { registerCustomMatchers } from './matchers.mjs';

// allows using expect.extend instead of chai.use to extend plugins
chai.use(JestExtend);
// adds all jest matchers to expect
chai.use(JestChaiExpect);
// adds asymmetric matchers like stringContaining, objectContaining
chai.use(JestAsymmetricMatchers);
// add our custom matchers
chai.use(registerCustomMatchers);

// expose so we don't need to import `expect` in every test file
globalThis.expect = chai.expect;
// Expose globals for karma compat
globalThis.LWC = LWC;
// globalThis.jasmine = await import('vitest');
// globalThis.beforeAll = globalThis.jasmine.beforeAll;

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
                value: replacer(original),
            });
        },
    });
}

hijackGlobal('describe', (describe) => {
    describe.runIf = (condition) => (condition ? globalThis.describe : globalThis.xdescribe);
    describe.skipIf = (condition) => (condition ? globalThis.xdescribe : globalThis.describe);
    return describe;
});

hijackGlobal('it', (it) => {
    it.runIf = (condition) => (condition ? globalThis.it : globalThis.xit);
    it.skipIf = (condition) => (condition ? globalThis.xit : globalThis.it);
    return it;
});
