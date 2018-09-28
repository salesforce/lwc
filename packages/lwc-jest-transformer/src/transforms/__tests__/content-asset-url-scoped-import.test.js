const test = require('./utils/test-transform').test(
    require('../content-asset-url-scoped-import')
);

describe('@salesforce/contentAssetUrl import', () => {
    test('does default transformation', `
        import myResource from '@salesforce/contentAssetUrl/foo';
    `, `
        let myResource;

        try {
          myResource = require('@salesforce/contentAssetUrl/foo').default;
        } catch (e) {
          myResource = 'foo';
        }
    `);

    test('allows non-@salesforce/contentAssetUrl named imports', `
        import { otherNamed } from './something-valid';
        import myResource from '@salesforce/contentAssetUrl/foo';
    `, `
        import { otherNamed } from './something-valid';
        let myResource;

        try {
          myResource = require('@salesforce/contentAssetUrl/foo').default;
        } catch (e) {
          myResource = 'foo';
        }
    `);

    test('throws error if using named import', `
        import { myAsset } from '@salesforce/contentAssetUrl/foo';
    `, undefined, 'Invalid import from @salesforce/contentAssetUrl/foo');

    test('throws error if renamed default imports', `
        import { default as asset } from '@salesforce/contentAssetUrl/foo';
    `, undefined, 'Invalid import from @salesforce/contentAssetUrl/foo');

    test('throws error if renamed multiple default imports', `
        import { default as asset, foo } from '@salesforce/contentAssetUrl/foo';
    `, undefined, 'Invalid import from @salesforce/contentAssetUrl/foo');
});
