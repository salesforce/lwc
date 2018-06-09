const test = require('./utils/test-transform').test(
    require('../label-schema-import.js')
);

describe('@label import', () => {
    test('does default transformation', `
        import myLabel from '@label/c.foo';
    `, `
        let myLabel;

        try {
          myLabel = require("@label/c.foo").default;
        } catch (e) {
          myLabel = "c.foo";
        }
    `);

    test('allows non-@label named imports', `
        import { otherNamed } from './something-valid';
        import myLabel from '@label/c.foo';
    `, `
        import { otherNamed } from './something-valid';
        let myLabel;

        try {
          myLabel = require("@label/c.foo").default;
        } catch (e) {
          myLabel = "c.foo";
        }
    `);

    test('throws error if using named import', `
        import { myLabel } from '@label/c.foo';
    `, undefined, 'Invalid import from @label/c.foo');

    test('throws error if renamed default imports', `
        import { default as label } from '@label/c.foo';
    `, undefined, 'Invalid import from @label/c.foo');

    test('throws error if renamed multipel default imports', `
        import { default as label, foo } from '@label/c.foo';
    `, undefined, 'Invalid import from @label/c.foo');
});
