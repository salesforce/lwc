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

    pluginTest('compiler should correctly point out missing "api" decorator import error', `
        import { LightningElement } from 'lwc';
        export default class Test extends LightningElement {
            @api title = 'hello'
        }
    `, {
        error: {
            message: "Invalid decorator usage. It seems that you are not importing '@api' decorator from the 'lwc'",
        }
    });

    pluginTest('compiler should correctly point out missing "track" decorator import error', `
        import { LightningElement } from 'lwc';
        export default class Test extends LightningElement {
            @track title = 'hello'
        }
    `, {
        error: {
            message: "Invalid decorator usage. It seems that you are not importing '@track' decorator from the 'lwc'",
        }
    });

    pluginTest('compiler should correctly point out missing "wire" decorator import error', `
        import { LightningElement } from 'lwc';
        import { getTodo } from "todo";
        export default class Test extends LightningElement {
            @wire(getTodo, {})
            data = {};
        }
    `, {
        error: {
            message: "Invalid decorator usage. It seems that you are not importing '@wire' decorator from the 'lwc'",
        }
    });

    pluginTest('compiler should correctly point out missing "track" decorator import from the inner class', `
        import { LightningElement } from 'lwc';
        export default class Test extends Inner {}
        class Inner extends LightningElement {
            @track
            name = 'h';
        }
    `, {
        error: {
            message: "Invalid decorator usage. Supported decorators (api, wire, track) should be imported from \"lwc\"",
        }
    });
})
