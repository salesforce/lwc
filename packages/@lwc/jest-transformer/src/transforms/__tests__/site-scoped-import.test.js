/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const test = require('./utils/test-transform').test(require('../site-scoped-import'));
const DEFAULT_ID = '000000000000000';

describe('@salesforce/site import', () => {
    test(
        'does default transformation',
        `
        import NetworkId from '@salesforce/site/NetworkId';
    `,
        `
        let NetworkId;

        try {
          NetworkId = require("@salesforce/site/NetworkId").default;
        } catch (e) {
          NetworkId = "${DEFAULT_ID}";
        }
    `
    );

    test(
        'allows non-@salesforce/site/NetworkId named imports',
        `
        import { otherNamed } from './something-valid';
        import NetworkId from '@salesforce/site/NetworkId';
    `,
        `
        import { otherNamed } from './something-valid';
        let NetworkId;

        try {
          NetworkId = require("@salesforce/site/NetworkId").default;
        } catch (e) {
          NetworkId = "${DEFAULT_ID}";
        }
    `
    );
});
