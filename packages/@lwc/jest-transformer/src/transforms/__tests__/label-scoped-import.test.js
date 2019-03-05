/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const test = require('./utils/test-transform').test(require('../label-scoped-import'));

describe('@salesforce/label import', () => {
    test(
        'does default transformation',
        `
        import myLabel from '@salesforce/label/c.foo';
    `,
        `
        let myLabel;

        try {
          myLabel = require("@salesforce/label/c.foo").default;
        } catch (e) {
          myLabel = "c.foo";
        }
    `
    );

    test(
        'allows non-@salesforce/label named imports',
        `
        import { otherNamed } from './something-valid';
        import myLabel from '@salesforce/label/c.foo';
    `,
        `
        import { otherNamed } from './something-valid';
        let myLabel;

        try {
          myLabel = require("@salesforce/label/c.foo").default;
        } catch (e) {
          myLabel = "c.foo";
        }
    `
    );

    test(
        'throws error if using named import',
        `
        import { myLabel } from '@salesforce/label/c.foo';
    `,
        undefined,
        'Invalid import from @salesforce/label/c.foo'
    );

    test(
        'throws error if renamed default imports',
        `
        import { default as label } from '@salesforce/label/c.foo';
    `,
        undefined,
        'Invalid import from @salesforce/label/c.foo'
    );

    test(
        'throws error if renamed multiple default imports',
        `
        import { default as label, foo } from '@salesforce/label/c.foo';
    `,
        undefined,
        'Invalid import from @salesforce/label/c.foo'
    );
});
