/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const test = require('./utils/test-transform').test(
    require('../apex-scoped-import')
);

describe('@salesforce/apex import', () => {
    test('does default transformation', `
        import myMethod from '@salesforce/apex/FooController.fooMethod';
    `, `
        global.__lwcJestResolvedPromise = global.__lwcJestResolvedPromise || function () {
          return Promise.resolve();
        };

        let myMethod;

        try {
          myMethod = require("@salesforce/apex/FooController.fooMethod").default;
        } catch (e) {
          myMethod = global.__lwcJestResolvedPromise;
        }
    `);

    test('allows non-@salesforce/apex named imports', `
        import { otherNamed } from './something-valid';
        import myMethod from '@salesforce/apex/FooController.fooMethod';
    `, `
        import { otherNamed } from './something-valid';

        global.__lwcJestResolvedPromise = global.__lwcJestResolvedPromise || function () {
          return Promise.resolve();
        };

        let myMethod;

        try {
          myMethod = require("@salesforce/apex/FooController.fooMethod").default;
        } catch (e) {
          myMethod = global.__lwcJestResolvedPromise;
        }
    `);

    test('transforms named imports from @salesforce/apex', `
        import { refreshApex, getSObjectValue } from '@salesforce/apex';
    `, `
        let refreshApex;

        try {
          refreshApex = require("@salesforce/apex").refreshApex;
        } catch (e) {
          refreshApex = jest.fn();
        }

        let getSObjectValue;

        try {
          getSObjectValue = require("@salesforce/apex").getSObjectValue;
        } catch (e) {
          getSObjectValue = jest.fn();
        }
    `);

    // test('throws error if using named import', `
    //     import { Id } from '@salesforce/apex/FooController.fooMethod';
    // `, undefined, 'Invalid import from @salesforce/apex/FooController.fooMethod');

    // test('throws error if renamed default imports', `
    //     import { default as label } from '@salesforce/apex/FooController.fooMethod';
    // `, undefined, 'Invalid import from @salesforce/apex/FooController.fooMethod');

    // test('throws error if renamed multiple default imports', `
    //     import { default as label, foo } from '@salesforce/apex/FooController.fooMethod';
    // `, undefined, 'Invalid import from @salesforce/apex/FooController.fooMethod');
});
