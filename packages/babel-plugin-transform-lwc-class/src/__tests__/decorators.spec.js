const pluginTest = require('./utils/test-transform').pluginTest(
    require('../index')
);

describe('decorators', () => {
    pluginTest('should throw if an global decorator is used on class field', `
        export default class Test {
            @api test = false;
        }
    `, {
        error: {
            message: 'test.js: Invalid decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"',
            loc: {
                line: 10,
                column: 0
            }
        }
    });

    pluginTest('should throw if an global decorator is used on class methods', `
        export default class Test {
            @api
            test() {}
        }
    `, {
        error: {
            message: 'test.js: Invalid decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"',
            loc: {
                line: 10,
                column: 0
            }
        }
    });

    pluginTest('throws if a decorator is used as a function', `
        import { track } from 'lwc';
        track(true)
    `, {
        error: {
            message: 'test.js: "track" can only be used as a class decorator',
            loc: {
                line: 10,
                column: 0
            }
        }
    });

    pluginTest('throws if a decorator is dereferenced', `
        import { track } from 'lwc';
        const trock = track;
        export default class Test {
            @trock field
        }
    `, {
        error: {
            message: 'test.js: "track" can only be used as a class decorator',
            loc: {
                line: 10,
                column: 0
            }
        }
    });

    pluginTest('throws if a decorator is not used on class properties', `
        import { track } from 'lwc';
        @track
        class foo {}
    `, {
        error: {
            message: 'test.js: "@track" can only be applied on class properties',
            loc: {
                line: 10,
                column: 0
            }
        }
    });
})
