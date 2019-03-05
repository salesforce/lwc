/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const test = require('./utils/test-transform').test(require('../apex-continuation-scoped-import'));

describe('@salesforce/apexContinuation import', () => {
    test(
        'does default transformation',
        `
        import myMethod from '@salesforce/apexContinuation/FooController.fooMethod';
    `,
        `
        let myMethod;

        try {
          myMethod = require("@salesforce/apexContinuation/FooController.fooMethod").default;
        } catch (e) {
          global.__lwcJestMock_myMethod = global.__lwcJestMock_myMethod || function myMethod() {
            return Promise.resolve();
          };

          myMethod = global.__lwcJestMock_myMethod;
        }
    `
    );

    test(
        'allows non-@salesforce/apexContinuation named imports',
        `
        import { otherNamed } from './something-valid';
        import myMethod from '@salesforce/apexContinuation/FooController.fooMethod';
    `,
        `
        import { otherNamed } from './something-valid';
        let myMethod;

        try {
          myMethod = require("@salesforce/apexContinuation/FooController.fooMethod").default;
        } catch (e) {
          global.__lwcJestMock_myMethod = global.__lwcJestMock_myMethod || function myMethod() {
            return Promise.resolve();
          };

          myMethod = global.__lwcJestMock_myMethod;
        }
    `
    );
});
