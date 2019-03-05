/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const test = require('./utils/test-transform').test(require('../schema-scoped-import'));

describe('@salesforce/schema import', () => {
    test(
        'does SObject schema transformation',
        `
        import objectApiName from '@salesforce/schema/Opportunity';
    `,
        `
        let objectApiName;

        try {
          objectApiName = require("@salesforce/schema/Opportunity").default;
        } catch (e) {
          objectApiName = {
            objectApiName: "Opportunity"
          };
        }
    `
    );

    test(
        'does field schema transformation',
        `
        import objectApiName from '@salesforce/schema/Opportunity.Account';
    `,
        `
        let objectApiName;

        try {
          objectApiName = require("@salesforce/schema/Opportunity.Account").default;
        } catch (e) {
          objectApiName = {
            objectApiName: "Opportunity",
            fieldApiName: "Account"
          };
        }
    `
    );

    test(
        'does spanning field schema transformation',
        `
        import objectApiName from '@salesforce/schema/Opportunity.Account.Name';
    `,
        `
        let objectApiName;

        try {
          objectApiName = require("@salesforce/schema/Opportunity.Account.Name").default;
        } catch (e) {
          objectApiName = {
            objectApiName: "Opportunity",
            fieldApiName: "Account.Name"
          };
        }
    `
    );

    test(
        'allows non-@salesforce/schema named imports',
        `
        import { otherNamed } from './something-valid';
        import objectApiName from '@salesforce/schema/Opportunity';
    `,
        `
        import { otherNamed } from './something-valid';
        let objectApiName;

        try {
          objectApiName = require("@salesforce/schema/Opportunity").default;
        } catch (e) {
          objectApiName = {
            objectApiName: "Opportunity"
          };
        }
    `
    );

    test(
        'throws error if using named import',
        `
        import { myResource } from '@salesforce/schema/Opportunity.Account.Name';
    `,
        undefined,
        'Invalid import from @salesforce/schema/Opportunity.Account.Name'
    );

    test(
        'throws error if renamed default imports',
        `
        import { default as resource } from '@salesforce/schema/Opportunity.Account.Name';
    `,
        undefined,
        'Invalid import from @salesforce/schema/Opportunity.Account.Name'
    );

    test(
        'throws error if renamed multiple default imports',
        `
        import { default as resource, foo } from '@salesforce/schema/Opportunity.Account.Name';
    `,
        undefined,
        'Invalid import from @salesforce/schema/Opportunity.Account.Name'
    );
});
