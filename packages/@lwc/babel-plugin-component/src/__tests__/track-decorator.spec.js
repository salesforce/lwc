/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const pluginTest = require('./utils/test-transform').pluginTest(require('../index'));

describe('Transform property', () => {
    pluginTest(
        'transform track decorator field',
        `
        import { track } from 'lwc';
        export default class Test {
            @track record;
        }
    `,
        {
            output: {
                code: `
                import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
                import _tmpl from "./test.html";

                class Test {
                  record;
                }

                _registerDecorators(Test, {
                  track: {
                    record: 1
                  }
                });

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `,
            },
        }
    );

    pluginTest(
        'transform track decorator preserve intial value',
        `
        import { track } from 'lwc';
        export default class Test {
            @track record = {
                value: 'test'
            };
        }
    `,
        {
            output: {
                code: `
                import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
                import _tmpl from "./test.html";

                class Test {
                  record = {
                    value: "test"
                  };
                }

                _registerDecorators(Test, {
                  track: {
                    record: 1
                  }
                });

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `,
            },
        }
    );

    pluginTest(
        'throws if track decorator is applied to a getter',
        `
        import { track } from 'lwc';
        export default class Test {
            @track get record() {
                return 'test';
            }
        }
    `,
        {
            error: {
                message: '@track decorator can only be applied to class properties.',
                loc: {
                    line: 3,
                    column: 0,
                    length: 6,
                    start: 57,
                },
            },
        }
    );

    pluginTest(
        'throws if track decorator is applied to a setter',
        `
        import { track } from 'lwc';
        export default class Test {
            _record;

            @track set record(value) {
                this._record = value;
            }
        }
    `,
        {
            error: {
                message: '@track decorator can only be applied to class properties.',
                loc: {
                    line: 4,
                    column: 0,
                    length: 6,
                    start: 66,
                },
            },
        }
    );

    pluginTest(
        'throws if track decorator is applied to a class method',
        `
        import { track } from 'lwc';
        export default class Test {
            _record;

            @track changeRecord(value) {
                this._record = value;
            }
        }
    `,
        {
            error: {
                message: '@track decorator can only be applied to class properties.',
                loc: {
                    line: 4,
                    column: 0,
                    length: 6,
                    start: 66,
                },
            },
        }
    );
});
