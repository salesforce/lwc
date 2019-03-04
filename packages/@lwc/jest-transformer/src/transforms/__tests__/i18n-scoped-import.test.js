/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const test = require('./utils/test-transform').test(require('../i18n-scoped-import'));

describe('@salesforce/i18n import', () => {
    test(
        'does default transformation',
        `
        import lang from '@salesforce/i18n/lang';
    `,
        `
        let lang;

        try {
          lang = require("@salesforce/i18n/lang").default;
        } catch (e) {
          lang = "en";
        }
    `
    );

    test(
        'does default transformation for import id with prefix',
        `
        import shortDateFormat from '@salesforce/i18n/dateTime.shortDateFormat';
    `,
        `
        let shortDateFormat;

        try {
          shortDateFormat = require("@salesforce/i18n/dateTime.shortDateFormat").default;
        } catch (e) {
          shortDateFormat = "M/d/yyyy";
        }
    `
    );

    test(
        'allows non-@salesforce/i18n named imports',
        `
        import { otherNamed } from './something-valid';
        import lang from '@salesforce/i18n/lang';
    `,
        `
        import { otherNamed } from './something-valid';
        let lang;

        try {
          lang = require("@salesforce/i18n/lang").default;
        } catch (e) {
          lang = "en";
        }
    `
    );

    test(
        'throws error if using named import',
        `
        import { lang } from '@salesforce/i18n/lang';
    `,
        undefined,
        'Invalid import from @salesforce/i18n/lang'
    );

    test(
        'throws error if renamed default imports',
        `
        import { default as label } from '@salesforce/i18n/lang';
    `,
        undefined,
        'Invalid import from @salesforce/i18n/lang'
    );

    test(
        'throws error if renamed multiple default imports',
        `
        import { default as label, foo } from '@salesforce/i18n/lang';
    `,
        undefined,
        'Invalid import from @salesforce/i18n/lang'
    );
});
