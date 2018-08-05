const pluginTest = require('./utils/test-transform').pluginTest(
    require('../index')
);

describe('Element import', () => {
    pluginTest('throws if using default import on lwc', `
        import engine from 'lwc';
    `, {
        error: {
            message: `test.js: Invalid import. "lwc" doesn't have default export.`,
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
            message: `test.js: Invalid import. Namespace imports are not allowed on "lwc", instead use named imports "import { LightningElement } from 'lwc'".`,
            loc: {
                line: 1,
                column: 7,
            }
        }
    });

    pluginTest('throw an error if the component class is anonymous', `
        import { LightningElement } from 'lwc';

        export default class extends LightningElement {}
    `, {
        error: {
            message: `test.js: LWC component class can't be an anonymous.`,
            loc: {
                line: 3,
                column: 15
            }
        }
    });

    pluginTest('allow to remap the import to Element', `
        import { LightningElement as Component } from 'lwc';

        export default class Test extends Component {}
    `, {
        output: {
            code: `import _tmpl from "./test.html";
import { LightningElement as Component } from 'lwc';
export default class Test extends Component {
  render() {
    return _tmpl;
  }

}`
        }
    });
});

describe('observedAttributes array', () => {
    pluginTest('throws if user defined observedAttributes', `
        import { Element as Component } from 'lwc';

        export default class Test extends Component {
            static observedAttributes = ['foo', 'title', 'tabindex'];
        }
    `, {
        error: {
            message: `test.js: Invalid static property "observedAttributes". "observedAttributes" cannot be used to track attribute changes. Define setters for "foo", "title", "tabIndex" instead.`,
            loc: {
                line: 1,
                column: 7,
            }
        }
    });
})

describe('render method', () => {
    pluginTest('inject render method', `
        import { LightningElement } from "lwc";
        export default class Test extends LightningElement {}
    `, {
        output: {
            code: `import _tmpl from "./test.html";
import { LightningElement } from "lwc";
export default class Test extends LightningElement {
  render() {
    return _tmpl;
  }

}`
        }
    });

    pluginTest(`keep the render method if present`, `
        import { LightningElement } from "lwc";
        export default class Test extends LightningElement {
            render() {}
        }
    `, {
        output: {
            code: `import { LightningElement } from "lwc";
export default class Test extends LightningElement {
  render() {}

}`
        }
    });

    pluginTest('only inject render in the exported class', `
        import { LightningElement } from 'lwc';

        class Test1 extends LightningElement {}

        export default class Test2 extends LightningElement {}
    `, {
        output: {
            code: `import _tmpl from "./test.html";
import { LightningElement } from 'lwc';

class Test1 extends LightningElement {}

export default class Test2 extends LightningElement {
  render() {
    return _tmpl;
  }

}`
        }
    })
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
                }
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
                }
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
            @api get todo () {return this._privateTodo;}
            @api set todo (val) {return this._privateTodo = val;}
        }
    `,
        {
            output: {
                metadata: {
                    decorators: [
                        {
                            type: "api",
                            targets: [
                                { type: "property", name: "publicProp" },
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
                                end: { line: 10, column: 44 }
                            },
                            decorator: "api"
                        }
                    ],
                    declarationLoc: {
                        start: { line: 3, column: 0 },
                        end: { line: 12, column: 1 }
                    }
                }
            }
        }
    );
});
