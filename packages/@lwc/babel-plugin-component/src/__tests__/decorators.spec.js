/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const pluginTest = require('./utils/test-transform').pluginTest(require('../index'));

describe('decorators', () => {
    pluginTest(
        'should throw if an global decorator is used on class field',
        `
        export default class Test {
            @api test = false;
        }
    `,
        {
            error: {
                message:
                    'Invalid decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"',
                loc: {
                    line: 10,
                    column: 0,
                },
            },
        }
    );

    pluginTest(
        'should throw if an global decorator is used on class methods',
        `
        export default class Test {
            @api
            test() {}
        }
    `,
        {
            error: {
                message:
                    'Invalid decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"',
                loc: {
                    line: 10,
                    column: 0,
                },
            },
        }
    );

    pluginTest(
        'throws if a decorator is used as a function',
        `
        import { track } from 'lwc';
        track(true)
    `,
        {
            error: {
                message: '"track" can only be used as a class decorator',
                loc: {
                    line: 10,
                    column: 0,
                },
            },
        }
    );

    pluginTest(
        'throws if a decorator is dereferenced',
        `
        import { track } from 'lwc';
        const trock = track;
        export default class Test {
            @trock field
        }
    `,
        {
            error: {
                message: '"track" can only be used as a class decorator',
                loc: {
                    line: 10,
                    column: 0,
                },
            },
        }
    );

    pluginTest(
        'throws if a decorator is not used on class properties',
        `
        import { track } from 'lwc';
        @track
        class foo {}
    `,
        {
            error: {
                message: '"@track" can only be applied on class properties',
                loc: {
                    line: 10,
                    column: 0,
                },
            },
        }
    );

    pluginTest(
        'compiler should throw when "api" decorator was not imported from lwc',
        `
        import { LightningElement } from 'lwc';
        export default class Test extends LightningElement {
            @api title = 'hello'
        }
    `,
        {
            error: {
                message:
                    'Invalid decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"',
            },
        }
    );

    pluginTest(
        'compiler should throw when "track" decorator was not imported from lwc',
        `
        import { LightningElement } from 'lwc';
        export default class Test extends LightningElement {
            @track title = 'hello'
        }
    `,
        {
            error: {
                message:
                    'Invalid decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"',
            },
        }
    );

    pluginTest(
        'compiler should throw when "wire" decorator was not imported from lwc',
        `
        import { LightningElement } from 'lwc';
        import { getTodo } from "todo";
        export default class Test extends LightningElement {
            @wire(getTodo, {})
            data = {};
        }
    `,
        {
            error: {
                message:
                    'Invalid decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"',
            },
        }
    );
});
