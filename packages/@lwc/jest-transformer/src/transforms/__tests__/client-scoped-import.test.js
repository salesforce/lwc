/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const test = require('./utils/test-transform').test(require('../client-scoped-import'));

const DEFAULT_FORM_FACTOR = 'Large';

describe('@salesforce/client/formFactor import', () => {
    test(
        'does default transformation',
        `
    import formFactor from '@salesforce/client/formFactor';
`,
        `
    let formFactor;

    try {
      formFactor = require("@salesforce/client/formFactor").default;
    } catch (e) {
      formFactor = "${DEFAULT_FORM_FACTOR}";
    }
`
    );

    test(
        'allows non-@salesforce/client/formFactor named imports',
        `
    import { otherNamed } from './something-valid';
    import formFactor from '@salesforce/client/formFactor';
`,
        `
    import { otherNamed } from './something-valid';
    let formFactor;

    try {
      formFactor = require("@salesforce/client/formFactor").default;
    } catch (e) {
      formFactor = "${DEFAULT_FORM_FACTOR}";
    }
`
    );

    test(
        'throws error if using named import',
        `
    import { formFactor } from '@salesforce/client/formFactor';
`,
        undefined,
        'Invalid import from @salesforce/client/formFactor'
    );

    test(
        'throws error if renamed default imports',
        `
    import { default as clientSize } from '@salesforce/client/formFactor';
`,
        undefined,
        'Invalid import from @salesforce/client/formFactor'
    );

    test(
        'throws error if renamed multiple default imports',
        `
    import { default as label, foo } from '@salesforce/client/formFactor';
`,
        undefined,
        'Invalid import from @salesforce/client/formFactor'
    );
});
