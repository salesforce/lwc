import { JestAsymmetricMatchers, JestChaiExpect, JestExtend } from '@vitest/expect';
import * as chai from 'chai';
import * as LWC from 'lwc';

// allows using expect.extend instead of chai.use to extend plugins
chai.use(JestExtend);
// adds all jest matchers to expect
chai.use(JestChaiExpect);
// adds asymmetric matchers like stringContaining, objectContaining
chai.use(JestAsymmetricMatchers);
// expose so we don't need to import `expect` in every test file
// globalThis.expect = chai.expect;

// Expose globals for karma compat
globalThis.LWC = LWC;
// globalThis.jasmine = await import('vitest');
// globalThis.beforeAll = globalThis.jasmine.beforeAll;

// The test framework doesn't expose any hooks to patch mocha before running tests,
// so this hack lets us modify mocha when it gets assigned to the global object.
Object.defineProperty(globalThis, 'Mocha', {
    configurable: true,
    enumerable: true,
    set(mocha) {
        delete window.Mocha; // remove this descriptor
        window.Mocha = mocha;
        debugger;

        // The following (`runIf`, `skipIf`, etc.) are based on Vite's APIs: https://vitest.dev/api/
        // This allows us to use the vitest/no-conditional-tests ESLint rule and get the same total # of tests for
        // every variant of a test run (e.g. `DISABLE_SYNTHETIC=1`, `NODE_ENV_FOR_TEST=production`, etc.)
        mocha.describe.runIf = (condition) => (condition ? describe : xdescribe);
        mocha.describe.skipIf = (condition) => (condition ? xdescribe : describe);
        mocha.it.runIf = (condition) => (condition ? it : xit);
        mocha.it.skipIf = (condition) => (condition ? xit : it);
    },
});
