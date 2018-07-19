const test = require('./utils/test-transform').test(
    require('../resource-scoped-import')
);

describe('@salesforce/resource-url import', () => {
    test('does default transformation', `
        import myResource from '@salesforce/resource-url/c.foo';
    `, `
        let myResource;

        try {
          myResource = require("@salesforce/resource-url/c.foo").default;
        } catch (e) {
          myResource = "c.foo";
        }
    `);

    test('allows non-@salesforce/resource-url named imports', `
        import { otherNamed } from './something-valid';
        import myResource from '@salesforce/resource-url/c.foo';
    `, `
        import { otherNamed } from './something-valid';
        let myResource;

        try {
          myResource = require("@salesforce/resource-url/c.foo").default;
        } catch (e) {
          myResource = "c.foo";
        }
    `);

    test('throws error if using named import', `
        import { myResource } from '@salesforce/resource-url/c.foo';
    `, undefined, 'Invalid import from @salesforce/resource-url/c.foo');

    test('throws error if renamed default imports', `
        import { default as resource } from '@salesforce/resource-url/c.foo';
    `, undefined, 'Invalid import from @salesforce/resource-url/c.foo');

    test('throws error if renamed multipel default imports', `
        import { default as resource, foo } from '@salesforce/resource-url/c.foo';
    `, undefined, 'Invalid import from @salesforce/resource-url/c.foo');
});
