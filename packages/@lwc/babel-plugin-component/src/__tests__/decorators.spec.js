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
                message: `Invalid 'api' decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"`,
                loc: {
                    line: 2,
                    column: 0,
                    length: 18,
                    start: 28,
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
                message: `Invalid 'api' decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"`,
                loc: {
                    line: 2,
                    column: 0,
                    length: 14,
                    start: 28,
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
                    line: 2,
                    column: 0,
                    length: 11,
                    start: 29,
                },
            },
        }
    );

    pluginTest(
        'should throw if a decorator is used as a member expression',
        `
        export default class Test {
            @foo.bar field
        }
    `,
        {
            error: {
                message: `Invalid decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"`,
                loc: {
                    line: 2,
                    column: 0,
                    length: 14,
                    start: 28,
                },
            },
        }
    );

    pluginTest(
        'should throw if a decorator is dereferenced',
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
                    line: 2,
                    column: 0,
                    length: 20,
                    start: 29,
                },
            },
        }
    );

    pluginTest(
        'should throw if a decorator is used on a class',
        `
        import { track } from 'lwc';
        @track
        class foo {}
    `,
        {
            error: {
                message: '"@track" can only be applied on class properties',
                loc: {
                    line: 2,
                    column: 0,
                    length: 19,
                    start: 29,
                },
            },
        }
    );

    pluginTest(
        'should throw when "api" decorator was not imported from lwc',
        `
        import { LightningElement } from 'lwc';
        export default class Test extends LightningElement {
            @api title = 'hello'
        }
    `,
        {
            error: {
                message: `Invalid 'api' decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"`,
                loc: {
                    line: 3,
                    column: 0,
                    length: 20,
                    start: 93,
                },
            },
        }
    );

    pluginTest(
        'should throw when "track" decorator was not imported from lwc',
        `
        import { LightningElement } from 'lwc';
        export default class Test extends LightningElement {
            @track title = 'hello'
        }
    `,
        {
            error: {
                message: `Invalid 'track' decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"`,
                loc: {
                    line: 3,
                    column: 0,
                    length: 22,
                    start: 93,
                },
            },
        }
    );

    pluginTest(
        'should throw when "wire" decorator was not imported from lwc',
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
                message: `Invalid 'wire' decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"`,
                loc: {
                    line: 4,
                    column: 0,
                    length: 29,
                    start: 125,
                },
            },
        }
    );

    pluginTest(
        'should register decorators for anonymous class declarations',
        `
        import { LightningElement, api } from 'lwc';
        export default class extends LightningElement {
            @api foo;
        }
    `,
        {
            output: {
                code: `
            import {
                registerDecorators as _registerDecorators,
                registerComponent as _registerComponent,
                LightningElement,
            } from "lwc";
            import _tmpl from "./test.html";
            export default _registerComponent(
                _registerDecorators(
                    class extends LightningElement {
                        foo;
                    },
                    {
                        publicProps: {
                            foo: {
                              config: 0,
                            },
                        },
                    }
                ),
                {
                    tmpl: _tmpl,
                }
            );
`,
            },
        }
    );

    pluginTest(
        'should register decorators for anonymous class expressions',
        `
        import { LightningElement, api } from 'lwc';
        const foo = class extends LightningElement {
            @api
            foo;
        }
        export default foo;
    `,
        {
            output: {
                code: `
            import _tmpl from "./test.html";
            import {
                registerComponent as _registerComponent,
                registerDecorators as _registerDecorators,
                LightningElement,
            } from "lwc";

            const foo = _registerDecorators(
                class extends LightningElement {
                    foo;
                },
                {
                    publicProps: {
                        foo: {
                            config: 0,
                        },
                    },
                }
            );

            export default _registerComponent(foo, {
                tmpl: _tmpl,
            });
`,
            },
        }
    );
});

describe('transform large input file', () => {
    beforeEach(() => {
        // Disable console.error because babel logs warnings if the file size is > 500KB
        const { error: originalConsoleError } = console;
        // eslint-disable-next-line no-console
        console.error = jest.spyOn(console, 'error').mockImplementation((...args) => {
            if (
                args.length > 0 &&
                // To be sure we are not letting any other real problems slip
                args[0]
                    .toString()
                    .includes('[BABEL] Note: The code generator has deoptimised the styling of')
            ) {
                return;
            }
            originalConsoleError(...args);
        });
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    const blob = 'export const Bar = "' + 'x'.repeat(500000) + '";';

    const stubClassDeclaration = `
        import { LightningElement, api } from 'lwc';
        export default class Foo extends LightningElement {
            @api
            prop;
        }
    `;

    const stubClassExpression = `
        import { LightningElement, api } from 'lwc';
        const Foo = class extends LightningElement {
            @api
            prop;
        }
        export default Foo;
    `;

    pluginTest(
        'should transform decorators on ClassDeclaration in a large input file',
        stubClassDeclaration + blob,
        {
            output: {
                code:
                    'import{registerDecorators as _registerDecorators,registerComponent as _registerComponent,LightningElement}from"lwc";' +
                    'import _tmpl from"./test.html";' +
                    'class Foo extends LightningElement{prop;}' +
                    // _registerDecorators is an ExpressionStatement, ends with a semicolon
                    '_registerDecorators(Foo,{publicProps:{prop:{config:0}}});' +
                    'export default _registerComponent(Foo,{tmpl:_tmpl});' +
                    blob,
            },
        }
    );

    pluginTest(
        'should transform decorators on ClassExpression in a large input file',
        stubClassExpression + blob,
        {
            output: {
                code:
                    'import _tmpl from"./test.html";' +
                    'import{registerComponent as _registerComponent,registerDecorators as _registerDecorators,LightningElement}from"lwc";' +
                    'const Foo=_registerDecorators(class extends LightningElement{prop;},{publicProps:{prop:{config:0}}});' +
                    'export default _registerComponent(Foo,{tmpl:_tmpl});' +
                    blob,
            },
        }
    );
});
