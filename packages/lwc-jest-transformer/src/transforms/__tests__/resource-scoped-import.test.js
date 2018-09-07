const test = require('./utils/test-transform').test(
    require('../resource-scoped-import')
);

describe('@salesforce/resourceUrl import', () => {
    test('does default transformation', `
        import myResource from '@salesforce/resourceUrl/c.foo';
    `, `
        let myResource;

        try {
          myResource = require('@salesforce/resourceUrl/c.foo').default;
        } catch (e) {
          myResource = 'c.foo';
        }
    `);

    test('allows non-@salesforce/resourceUrl named imports', `
        import { otherNamed } from './something-valid';
        import myResource from '@salesforce/resourceUrl/c.foo';
    `, `
        import { otherNamed } from './something-valid';
        let myResource;

        try {
          myResource = require('@salesforce/resourceUrl/c.foo').default;
        } catch (e) {
          myResource = 'c.foo';
        }
    `);

    test('throws error if using named import', `
        import { myResource } from '@salesforce/resourceUrl/c.foo';
    `, undefined, 'Invalid import from @salesforce/resourceUrl/c.foo');

    test('throws error if renamed default imports', `
        import { default as resource } from '@salesforce/resourceUrl/c.foo';
    `, undefined, 'Invalid import from @salesforce/resourceUrl/c.foo');

    test('throws error if renamed multiple default imports', `
        import { default as resource, foo } from '@salesforce/resourceUrl/c.foo';
    `, undefined, 'Invalid import from @salesforce/resourceUrl/c.foo');
});
