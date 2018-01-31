const test = require('./utils/test-transform').test(
    require('../index')
);

describe('decorators', () => {
    test('should throw if a decorator is not imported from engine', `
        export default class Test {
            @api
            test() {}
        }
    `, undefined, {
        message: 'test.js: Invalid decorator usage. Supported decorators (api, wire, track) should be imported from "engine"',
        loc: {
            line: 10,
            column: 0
        }
    });

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
