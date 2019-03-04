/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const test = require('./utils/test-transform').test(require('../resource-scoped-import'));

describe('@salesforce/resourceUrl import', () => {
    test(
        'does default transformation',
        `
        import myResource from '@salesforce/resourceUrl/foo';
    `,
        `
        let myResource;

        try {
          myResource = require("@salesforce/resourceUrl/foo").default;
        } catch (e) {
          myResource = "foo";
        }
    `
    );

    test(
        'does default transformation for namespaced values',
        `
        import myResource from '@salesforce/resourceUrl/ns__foo';
    `,
        `
        let myResource;

        try {
          myResource = require("@salesforce/resourceUrl/ns__foo").default;
        } catch (e) {
          myResource = "ns__foo";
        }
    `
    );

    test(
        'allows non-@salesforce/resourceUrl named imports',
        `
        import { otherNamed } from './something-valid';
        import myResource from '@salesforce/resourceUrl/foo';
    `,
        `
        import { otherNamed } from './something-valid';
        let myResource;

        try {
          myResource = require("@salesforce/resourceUrl/foo").default;
        } catch (e) {
          myResource = "foo";
        }
    `
    );

    test(
        'throws error if using named import',
        `
        import { myResource } from '@salesforce/resourceUrl/foo';
    `,
        undefined,
        'Invalid import from @salesforce/resourceUrl/foo'
    );

    test(
        'throws error if renamed default imports',
        `
        import { default as resource } from '@salesforce/resourceUrl/foo';
    `,
        undefined,
        'Invalid import from @salesforce/resourceUrl/foo'
    );

    test(
        'throws error if renamed multiple default imports',
        `
        import { default as resource, foo } from '@salesforce/resourceUrl/foo';
    `,
        undefined,
        'Invalid import from @salesforce/resourceUrl/foo'
    );
});
