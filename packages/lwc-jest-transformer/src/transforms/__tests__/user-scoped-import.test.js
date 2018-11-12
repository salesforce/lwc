const test = require('./utils/test-transform').test(
    require('../user-scoped-import')
);

const DEFAULT_ID = '005000000000000000';

describe('@salesforce/user import', () => {
    test('does default transformation', `
        import id from '@salesforce/user/Id';
    `, `
        let id;

        try {
          id = require("@salesforce/user/Id").default;
        } catch (e) {
          id = "${DEFAULT_ID}";
        }
    `);

    test('allows non-@salesforce/user/Id named imports', `
        import { otherNamed } from './something-valid';
        import id from '@salesforce/user/Id';
    `, `
        import { otherNamed } from './something-valid';
        let id;

        try {
          id = require("@salesforce/user/Id").default;
        } catch (e) {
          id = "${DEFAULT_ID}";
        }
    `);

    test('throws error if using named import', `
        import { Id } from '@salesforce/user/Id';
    `, undefined, 'Invalid import from @salesforce/user/Id');

    test('throws error if renamed default imports', `
        import { default as label } from '@salesforce/user/Id';
    `, undefined, 'Invalid import from @salesforce/user/Id');

    test('throws error if renamed multiple default imports', `
        import { default as label, foo } from '@salesforce/user/Id';
    `, undefined, 'Invalid import from @salesforce/user/Id');
});
