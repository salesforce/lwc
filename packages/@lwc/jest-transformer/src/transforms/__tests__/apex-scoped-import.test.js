const test = require('./utils/test-transform').test(
    require('../apex-scoped-import')
);

describe('@salesforce/apex import', () => {
    test('does default transformation', `
        import myMethod from '@salesforce/apex/FooController.fooMethod';
    `, `
        let myMethod;

        try {
          myMethod = require("@salesforce/apex/FooController.fooMethod").default;
        } catch (e) {
          myMethod = function () {
            return Promise.resolve();
          };
        }
    `);

    test('allows non-@salesforce/apex named imports', `
        import { otherNamed } from './something-valid';
        import myMethod from '@salesforce/apex/FooController.fooMethod';
    `, `
        import { otherNamed } from './something-valid';
        let myMethod;

        try {
          myMethod = require("@salesforce/apex/FooController.fooMethod").default;
        } catch (e) {
          myMethod = function () {
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

    test('throws error if renamed multiple default imports', `
        import { default as label, foo } from '@salesforce/apex/FooController.fooMethod';
    `, undefined, 'Invalid import from @salesforce/apex/FooController.fooMethod');
});
