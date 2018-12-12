/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const pluginTest = require('./utils/test-transform').pluginTest(
    require('../index')
);

describe('Transform property', () => {
    pluginTest('transform track decorator field', `
        import { track } from 'lwc';
        export default class Test {
            @track record;
        }
    `, {
        output: {
            code: `
                import { registerDecorators as _registerDecorators } from "lwc";
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                
                class Test {
                  constructor() {
                    this.record = void 0;
                  }
                }
                
                _registerDecorators(Test, {
                  track: {
                    record: 1
                  }
                });
                
                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `
        }
    });

    pluginTest('transform track decorator preserve intial value', `
        import { track } from 'lwc';
        export default class Test {
            @track record = {
                value: 'test'
            };
        }
    `, {
        output: {
            code: `
                import { registerDecorators as _registerDecorators } from "lwc";
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                
                class Test {
                  constructor() {
                    this.record = {
                      value: "test"
                    };
                  }
                }
                
                _registerDecorators(Test, {
                  track: {
                    record: 1
                  }
                });
                
                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `
        }
    });


    pluginTest('throws if track decorator is applied to a getter', `
        import { track } from 'lwc';
        export default class Test {
            @track get record() {
                return 'test';
            }
        }
    `, {
        error: {
            message: '@track decorator can only be applied to class properties.',
            loc: {
                line: 2,
                column: 11
            }
        }
    });

    pluginTest('throws if track decorator is applied to a setter', `
        import { track } from 'lwc';
        export default class Test {
            _record;

            @track set record(value) {
                this._record = value;
            }
        }
    `, {
        error: {
            message: '@track decorator can only be applied to class properties.',
            loc: {
                line: 4,
                column: 11
            }
        }
    });

    pluginTest('throws if track decorator is applied to a class method', `
        import { track } from 'lwc';
        export default class Test {
            _record;

            @track changeRecord(value) {
                this._record = value;
            }
        }
    `, {
        error: {
            message: '@track decorator can only be applied to class properties.',
            loc: {
                line: 4,
                column: 11
            }
        }
    });
});

describe('Metadata', () => {
    pluginTest(
        'gather metadata',
        `
        import { LightningElement, track } from 'lwc';
        export default class Test extends LightningElement {
            @track state;
        }
    `,
        {
            output: {
                metadata: {
                    decorators: [
                        {
                            type: "track",
                            targets: [{ name: "state", type: "property" }]
                        }
                    ],
                    classMembers: [
                        {
                            type: "property",
                            name: "state",
                            loc: {
                                start: { line: 3, column: 0 },
                                end: { line: 3, column: 13 }
                            },
                            decorator: "track"
                        }
                    ],
                    declarationLoc: {
                        end: { column: 1, line: 4 },
                        start: { column: 0, line: 2 }
                    },
                    exports: [
                        {
                            type: 'ExportDefaultDeclaration',
                        }
                    ],
                }
            }
        }
    );
});
