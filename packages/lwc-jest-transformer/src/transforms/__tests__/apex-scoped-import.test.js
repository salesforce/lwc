const test = require('./utils/test-transform').test(
    require('../apex-scoped-import')
);

const DEFAULT_FUNCTION = function() { return Promise.resolve(); };

describe('@salesforce/apex import', () => {
    test('does default transformation', `
        import fooMethod from '@salesforce/apex/FooController.fooMethod';
    `, `
        let fooMethod;

        try {
          fooMethod = require("@salesforce/apex/FooController.fooMethod").default;
        } catch (e) {
          fooMethod = function () {
            return Promise.resolve();
          };
        }
    `);

    test('allows non-@salesforce/apex named imports', `
        import { otherNamed } from './something-valid';
        import fooMethod from '@salesforce/apex/FooController.fooMethod';
    `, `
        import { otherNamed } from './something-valid';
        let fooMethod;

        try {
          fooMethod = require("@salesforce/apex/FooController.fooMethod").default;
        } catch (e) {
          fooMethod = function () {
            return Promise.resolve();
          };
        }
    `);

    test('throws error if using named import', `
        import { Id } from '@salesforce/apex/FooController.fooMethod';
    `, undefined, 'Invalid import from @salesforce/apex/FooController.fooMethod');

    test('throws error if renamed default imports', `
        import { default as label } from '@salesforce/apex/FooController.fooMethod';
    `, undefined, 'Invalid import from @salesforce/apex/FooController.fooMethod');

    test('throws error if renamed multipel default imports', `
        import { default as label, foo } from '@salesforce/apex/FooController.fooMethod';
    `, undefined, 'Invalid import from @salesforce/apex/FooController.fooMethod');
});
