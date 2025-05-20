import { JestAsymmetricMatchers, JestChaiExpect, JestExtend } from '@vitest/expect';
// This import ensures that the global `Mocha` object is present for mutation.
/* global Mocha:writable */
import '@web/test-runner-mocha';
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

// The following (`runIf`, `skipIf`, etc.) are based on Vite's APIs: https://vitest.dev/api/
// This allows us to use the vitest/no-conditional-tests ESLint rule and get the same total # of tests for
// every variant of a test run (e.g. `DISABLE_SYNTHETIC=1`, `NODE_ENV_FOR_TEST=production`, etc.)
Mocha.describe.runIf = (condition) => (condition ? Mocha.describe : Mocha.xdescribe);
Mocha.describe.skipIf = (condition) => (condition ? Mocha.xdescribe : Mocha.describe);
Mocha.it.runIf = (condition) => (condition ? Mocha.it : Mocha.xit);
Mocha.it.skipIf = (condition) => (condition ? Mocha.xit : Mocha.it);
