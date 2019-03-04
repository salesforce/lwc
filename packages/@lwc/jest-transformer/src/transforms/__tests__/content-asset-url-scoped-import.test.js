/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const test = require('./utils/test-transform').test(require('../content-asset-url-scoped-import'));

describe('@salesforce/contentAssetUrl import', () => {
    test(
        'does default transformation',
        `
        import myResource from '@salesforce/contentAssetUrl/foo';
    `,
        `
        let myResource;

        try {
          myResource = require("@salesforce/contentAssetUrl/foo").default;
        } catch (e) {
          myResource = "foo";
        }
    `
    );

    test(
        'does default transformation for namespaced values',
        `
        import myResource from '@salesforce/contentAssetUrl/ns__foo';
    `,
        `
        let myResource;

        try {
          myResource = require("@salesforce/contentAssetUrl/ns__foo").default;
        } catch (e) {
          myResource = "ns__foo";
        }
    `
    );

    test(
        'allows non-@salesforce/contentAssetUrl named imports',
        `
        import { otherNamed } from './something-valid';
        import myResource from '@salesforce/contentAssetUrl/foo';
    `,
        `
        import { otherNamed } from './something-valid';
        let myResource;

        try {
          myResource = require("@salesforce/contentAssetUrl/foo").default;
        } catch (e) {
          myResource = "foo";
        }
    `
    );

    test(
        'throws error if using named import',
        `
        import { myAsset } from '@salesforce/contentAssetUrl/foo';
    `,
        undefined,
        'Invalid import from @salesforce/contentAssetUrl/foo'
    );

    test(
        'throws error if renamed default imports',
        `
        import { default as asset } from '@salesforce/contentAssetUrl/foo';
    `,
        undefined,
        'Invalid import from @salesforce/contentAssetUrl/foo'
    );

    test(
        'throws error if renamed multiple default imports',
        `
        import { default as asset, foo } from '@salesforce/contentAssetUrl/foo';
    `,
        undefined,
        'Invalid import from @salesforce/contentAssetUrl/foo'
    );
});
