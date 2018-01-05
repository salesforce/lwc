const test = require('./utils/test-transform').test(
    require('../index')
);

describe('decorators', () => {
    test('should ignore decorators not imported from engine', `
        export default class Test {
            @api
            @track
            test() {}
        }
    `, `
        export default class Test {
            @api
            @track
            test() {}
        }
    `);

    test('throws if a decorator is used as a function', `
        import { track } from 'engine';
        track(true)
    `, undefined, {
        message: 'test.js: "track" can only be used as a class decorator',
        loc: {
            line: 2,
            column: 0
        }
    });

    test('throws if a decorator is dereferenced', `
        import { track } from 'engine';
        const trok = track;
        export default class Test {
            @trock field
        }
    `, undefined, {
        message: 'test.js: "track" can only be used as a class decorator',
        loc: {
            line: 2,
            column: 0
        }
    });

    test('throws if a decorator is not used on class properties', `
        import { track } from 'engine';
        @track
        class foo {}
    `, undefined, {
        message: 'test.js: "@track" can only be applied on class properties',
        loc: {
            line: 2,
            column: 0
        }
    });
})
