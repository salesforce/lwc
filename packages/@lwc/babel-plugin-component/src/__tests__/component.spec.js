/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const pluginTest = require('./utils/test-transform').pluginTest(
    require('../index')
);


describe('Element import', () => {
    pluginTest('throws if using default import on lwc', `
        import engine from 'lwc';
    `, {
        error: {
            message: `Invalid import. "lwc" doesn't have default export.`,
            loc: {
                line: 1,
                column: 7,
            }
        }
    });

    pluginTest('throws if using namespace import on lwc', `
        import * as engine from 'lwc';
        export default class extends engine.LightningElement {}
    `, {
        error: {
            message: `Invalid import. Namespace imports are not allowed on "lwc", instead use named imports "import { LightningElement } from 'lwc'".`,
            loc: {
                line: 1,
                column: 7,
            }
        }
    });

    pluginTest('allow to remap the import to LightningElement', `
        import { LightningElement as Component } from 'lwc';

        export default class Test extends Component {}
    `, {
        output: {
            code: `
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                import { LightningElement as Component } from "lwc";

                class Test extends Component {}

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `
        }
    });

    pluginTest('throws non-whitelisted lwc api is imported', `
        import { registerTemplate } from "lwc";
        import tmpl from './localTemplate.html';
        registerTemplate(tmpl);
    `, {
        error: {
            message: `Invalid import. "registerTemplate" is not part of the lwc api.`,
            loc: {
                line: 1,
                column: 7,
            }
        }
    });

    pluginTest('allows importing whitelisted apis from "lwc"', `
        import {
            api,
            track,
            wire,
            createElement,
            LightningElement,
            buildCustomElementConstructor,
            dangerousObjectMutation,
            getComponentDef,
            getComponentConstructor,
            isComponentConstructor,
            readonly,
            register,
            unwrap,
        } from "lwc";
    `, {
        output: {
            code: `import { api, track, wire, createElement, LightningElement, buildCustomElementConstructor, dangerousObjectMutation, getComponentDef, getComponentConstructor, isComponentConstructor, readonly, register, unwrap } from "lwc";`
        }
    });
});

describe('render method', () => {
    pluginTest('inject render method', `
        import { LightningElement } from "lwc";
        export default class Test extends LightningElement {}
    `, {
        output: {
            code: `
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                import { LightningElement } from "lwc";

                class Test extends LightningElement {}

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `
        }
    });

    pluginTest('does not insert render method when extending from legacy "engine" Element', `
        import { Element } from "engine";
        export default class Test extends Element {}
    `, {
        output: {
            code: `
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                import { Element } from "engine";

                class Test extends Element {}

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `
        }
    });

    pluginTest(`keep the render method if present`, `
        import { LightningElement } from "lwc";
        export default class Test extends LightningElement {
            render() {}
        }
    `, {
        output: {
            code: `
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                import { LightningElement } from "lwc";

                class Test extends LightningElement {
                  render() {}
                }

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `
        }
    });

    pluginTest('only inject render in the exported class', `
        import { LightningElement } from 'lwc';

        class Test1 extends LightningElement {}

        export default class Test2 extends LightningElement {}
    `, {
        output: {
            code: `
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                import { LightningElement } from "lwc";

                class Test1 extends LightningElement {}

                class Test2 extends LightningElement {}

                export default _registerComponent(Test2, {
                  tmpl: _tmpl
                });
                `
        }
    });
});

describe('metadata', () => {
    pluginTest('class jsdoc single line (and declarationLoc)', `
        import { LightningElement } from 'lwc';
        /** Foo doc */
        export default class Foo extends LightningElement {
        }
    `, {
        output: {
            metadata: {
                decorators: [],
                classMembers: [],
                declarationLoc: { start: { line: 3, column: 0 }, end: { line: 4, column: 1 }},
                doc: '* Foo doc',
                exports: [{ type: 'ExportDefaultDeclaration' }],
            }
        }
    });

    pluginTest('class jsdoc', `
        import { LightningElement } from 'lwc';
        /**
         * Foo doc
         */
        export default class Foo extends LightningElement {
        }
    `, {
        output: {
            metadata: {
                decorators: [],
                classMembers: [],
                declarationLoc: { end: { column: 1, line: 6 }, start: { column: 0, line: 5 } },
                doc: "*\n* Foo doc",
                exports: [{ type: 'ExportDefaultDeclaration' }],
            }
        }
    });

    pluginTest('class jsdoc multiline', `
        import { LightningElement } from 'lwc';
        /**
         * multi
         * line
         */
        export default class Foo extends LightningElement {
        }
    `, {
        output: {
            metadata: {
                decorators: [],
                classMembers: [],
                declarationLoc: { end: { column: 1, line: 7 }, start: { column: 0, line: 6 } },
                doc: '*\n* multi\n* line',
                exports: [{ type: 'ExportDefaultDeclaration' }],
            }
        }
    });

    pluginTest('class jsdoc multi comments', `
        import { LightningElement } from 'lwc';
        /** first */
        /** last */
        export default class Foo extends LightningElement {
        }
    `, {
        output: {
            metadata: {
                decorators: [],
                classMembers: [],
                declarationLoc: { end: { column: 1, line: 5 }, start: { column: 0, line: 4 } },
                doc: "* last",
                exports: [{ type: 'ExportDefaultDeclaration' }],
            },
        }
    });

    pluginTest('class jsdoc empty', `
        import { LightningElement } from 'lwc';
        /** */
        export default class Foo extends LightningElement {
        }
    `, {
        output: {
            metadata: {
                decorators: [],
                classMembers: [],
                doc: "*",
                declarationLoc: {
                    end: { column: 1, line: 4 },
                    start: { column: 0, line: 3 }
                },
                exports: [{ type: 'ExportDefaultDeclaration' }],
            }
        }
    });

    pluginTest('class no-jsdoc /**/', `
        import { LightningElement } from 'lwc';
        /* not a jsdoc */
        export default class Foo extends LightningElement {
        }
    `, {
        output: {
            metadata: {
                decorators: [],
                classMembers: [],
                declarationLoc: {
                    end: { column: 1, line: 4 },
                    start: { column: 0, line: 3 }
                },
                exports: [{ type: 'ExportDefaultDeclaration' }],
            }
        }
    });

    pluginTest('class no-jsdoc //', `
        import { LightningElement } from 'lwc';
        // not a jsdoc
        export default class Foo extends LightningElement {
        }
    `, {
        output: {
            metadata: {
                decorators: [],
                classMembers: [],
                declarationLoc: {
                    end: { column: 1, line: 4 },
                    start: { column: 0, line: 3 }
                },
                exports: [{ type: 'ExportDefaultDeclaration' }],
            }
        }
    });

    pluginTest('json in comment', `
        import { LightningElement } from 'lwc';
        /** { one: "1", two: '2', array: [1, 2, 3]} */
        export default class Foo extends LightningElement {
        }
    `, {
        output: {
            metadata: {
                decorators: [],
                classMembers: [],
                declarationLoc: {
                    end: { column: 1, line: 4 },
                    start: { column: 0, line: 3 }
                },
                doc: "* { one: \"1\", two: '2', array: [1, 2, 3]}",
                exports: [{ type: 'ExportDefaultDeclaration' }],
            }
        }
    });

    pluginTest(
        "tooling metadata",
        `
        import { LightningElement, api, track } from 'lwc';
        // not a jsdoc
        export default class Foo extends LightningElement {
            @track state;
            /** property-comment */ @api publicProp;
            /** method-comment */ @api publicMethod() {}
            privateProp;
            privateMethod() {}
            _privateTodo;
            @api
            get todo () {return this._privateTodo;}
            set todo (val) {return this._privateTodo = val;}
        }
    `,
        {
            output: {
                metadata: {
                    decorators: [
                        {
                            type: "api",
                            targets: [
                                { type: "property", name: "publicProp", value: { type: "unresolved", value: undefined } },
                                { type: "property", name: "todo" },
                                { type: "method", name: "publicMethod" }
                            ]
                        },
                        {
                            type: "track",
                            targets: [
                                { type: "property", name: "state" }
                            ]
                        }
                    ],
                    classMembers: [
                        {
                            type: "property",
                            name: "state",
                            loc: {
                                start: { line: 4, column: 0 },
                                end: { line: 4, column: 13 }
                            },
                            decorator: "track"
                        },
                        {
                            type: "property",
                            name: "publicProp",
                            value: { type: "unresolved", value: undefined },
                            loc: {
                                start: { line: 5, column: 24 },
                                end: { line: 5, column: 40 }
                            },
                            doc: "* property-comment",
                            decorator: "api"
                        },
                        {
                            type: "method",
                            name: "publicMethod",
                            loc: {
                                start: { line: 6, column: 22 },
                                end: { line: 6, column: 44 }
                            },
                            doc: "* method-comment",
                            decorator: "api"
                        },
                        {
                            type: "property",
                            name: "privateProp",
                            loc: {
                                start: { line: 7, column: 0 },
                                end: { line: 7, column: 12 }
                            }
                        },
                        {
                            type: "method",
                            name: "privateMethod",
                            loc: {
                                start: { line: 8, column: 0 },
                                end: { line: 8, column: 18 }
                            }
                        },
                        {
                            type: "property",
                            name: "todo",
                            loc: {
                                start: { line: 10, column: 0 },
                                end: { line: 11, column: 39 }
                            },
                            decorator: "api"
                        }
                    ],
                    declarationLoc: {
                        start: { line: 3, column: 0 },
                        end: { line: 13, column: 1 }
                    },
                    exports: [{ type: 'ExportDefaultDeclaration' }],
                }
            }
        }
    );

    pluginTest(
        "@api on getter only",
        `
        import { LightningElement, api} from 'lwc';
        export default class Foo extends LightningElement {
            @api
            get todo () {return this._privateTodo;}
            set todo (val) {return this._privateTodo = val;}
        }
    `,
        {
            output: {
                metadata: {
                    decorators: [
                        {
                            type: "api",
                            targets: [
                                { type: "property", name: "todo" },
                            ]
                        }
                    ],
                    classMembers: [
                        {
                            type: "property",
                            name: "todo",
                            loc: {
                                start: { line: 3, column: 0 },
                                end: { line: 4, column: 39 }
                            },
                            decorator: "api"
                        }
                    ],
                    declarationLoc: {
                        start: { line: 2, column: 0 },
                        end: { line: 6, column: 1 }
                    },
                    exports: [{ type: 'ExportDefaultDeclaration' }],
                }
            }
        }
    );

    pluginTest(
        "@api on getter only without a setter pair",
        `
        import { LightningElement, api} from 'lwc';
        export default class Foo extends LightningElement {
            @api
            get todo () {return this._privateTodo;}
        }
    `,
        {
            output: {
                metadata: {
                    decorators: [
                        {
                            type: "api",
                            targets: [
                                { type: "property", name: "todo" },
                            ]
                        }
                    ],
                    classMembers: [
                        {
                            type: "property",
                            name: "todo",
                            loc: {
                                start: { line: 3, column: 0 },
                                end: { line: 4, column: 39 }
                            },
                            decorator: "api"
                        }
                    ],
                    declarationLoc: {
                        start: { line: 2, column: 0 },
                        end: { line: 5, column: 1 }
                    },
                    exports: [{ type: 'ExportDefaultDeclaration' }],
                }
            }
        }
    );
});
