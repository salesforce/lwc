const test = require('./utils/test-transform').test(
    require('../component-tag-name-scoped-import')
);


describe('@salesforce/componentTagName import', () => {
    test('does default transformation', `
        import tagName from '@salesforce/componentTagName/c-foo';
    `, `
        let tagName;

        try {
          tagName = require('@salesforce/componentTagName/c-foo').default;
        } catch (e) {
          tagName = 'c-foo';
        }
    `);

    test('allows non-@salesforce/componentTagName named imports', `
        import { otherNamed } from './something-valid';
        import tagName from '@salesforce/componentTagName/c-foo';
    `, `
        import { otherNamed } from './something-valid';
        let tagName;

        try {
          tagName = require('@salesforce/componentTagName/c-foo').default;
        } catch (e) {
          tagName = 'c-foo';
        }
    `);

    test('throws error if using named import', `
        import { tagName } from '@salesforce/componentTagName/c-foo';
    `, undefined, 'Invalid import from @salesforce/componentTagName/c-foo');

    test('throws error if renamed default imports', `
        import { default as componentTagName } from '@salesforce/componentTagName/c-foo';
    `, undefined, 'Invalid import from @salesforce/componentTagName/c-foo');

    test('throws error if renamed multiple default imports', `
        import { default as componentTagName, foo } from '@salesforce/componentTagName/c-foo';
    `, undefined, 'Invalid import from @salesforce/componentTagName/c-foo');
});
