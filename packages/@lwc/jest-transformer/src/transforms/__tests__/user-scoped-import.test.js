/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const test = require('./utils/test-transform').test(require('../user-scoped-import'));

const DEFAULT_ID = '005000000000000000';
const DEFAULT_IS_GUEST = false;

describe('@salesforce/user/Id import', () => {
    test(
        'does default transformation',
        `
        import id from '@salesforce/user/Id';
    `,
        `
        let id;

        try {
          id = require("@salesforce/user/Id").default;
        } catch (e) {
          id = "${DEFAULT_ID}";
        }
    `
    );

    test(
        'allows non-@salesforce/user/Id named imports',
        `
        import { otherNamed } from './something-valid';
        import id from '@salesforce/user/Id';
    `,
        `
        import { otherNamed } from './something-valid';
        let id;

        try {
          id = require("@salesforce/user/Id").default;
        } catch (e) {
          id = "${DEFAULT_ID}";
        }
    `
    );

    test(
        'throws error if using named import',
        `
        import { Id } from '@salesforce/user/Id';
    `,
        undefined,
        'Invalid import from @salesforce/user/Id'
    );

    test(
        'throws error if renamed default imports',
        `
        import { default as label } from '@salesforce/user/Id';
    `,
        undefined,
        'Invalid import from @salesforce/user/Id'
    );

    test(
        'throws error if renamed multiple default imports',
        `
        import { default as label, foo } from '@salesforce/user/Id';
    `,
        undefined,
        'Invalid import from @salesforce/user/Id'
    );
});

describe('@salesforce/user/isGuest', () => {
    test(
        'does default transformation',
        `
        import isGuest from '@salesforce/user/isGuest';
        `,
        `
        let isGuest;

        try {
          isGuest = require("@salesforce/user/isGuest").default;
        } catch (e) {
          isGuest = ${DEFAULT_IS_GUEST};
        }
    `
    );

    test(
        'throws error if using named import',
        `
        import { isGuest } from '@salesforce/user/isGuest';
    `,
        undefined,
        'Invalid import from @salesforce/user/isGuest'
    );

    test(
        'throws error if renamed default imports',
        `
        import { default as label } from '@salesforce/user/isGuest';
    `,
        undefined,
        'Invalid import from @salesforce/user/isGuest'
    );

    test(
        'throws error if renamed multiple default imports',
        `
        import { default as label, foo } from '@salesforce/user/isGuest';
    `,
        undefined,
        'Invalid import from @salesforce/user/isGuest'
    );
});
