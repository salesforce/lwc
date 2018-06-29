const pluginTest = require('./utils/test-transform').pluginTest(
    require('../index')
);

describe('Element import', () => {
    pluginTest('throws if using default import on engine', `
        import engine from 'engine';
    `, {
        error: {
            message: `test.js: Invalid import. "engine" doesn't have default export.`,
            loc: {
                line: 1,
                column: 7,
            }
        }
    });

    pluginTest('throws if using namespace import on engine', `
        import * as engine from 'engine';
        export default class extends engine.Element {}
    `, {
        error: {
            message: `test.js: Invalid import. Namespace imports are not allowed on "engine", instead use named imports "import { Element } from 'engine'".`,
            loc: {
                line: 1,
                column: 7,
            }
        }
    });

    pluginTest('throw an error if the component class is anonymous', `
        import { Element } from 'engine';

        export default class extends Element {}
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
        import { Element as Component } from 'engine';

        export default class Test extends Component {}
    `, {
        output: {
            code: `import _tmpl from "./test.html";
import { Element as Component } from 'engine';
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
        import { Element as Component } from 'engine';

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
        import { Element } from "engine";
        export default class Test extends Element {}
    `, {
        output: {
            code: `import _tmpl from "./test.html";
import { Element } from "engine";
export default class Test extends Element {
  render() {
    return _tmpl;
  }

}`
        }
    });

    pluginTest(`keep the render method if present`, `
        import { Element } from "engine";
        export default class Test extends Element {
            render() {}
        }
    `, {
        output: {
            code: `import { Element } from "engine";
export default class Test extends Element {
  render() {}

}`
        }
    });

    pluginTest('only inject render in the exported class', `
        import { Element } from 'engine';

        class Test1 extends Element {}

        export default class Test2 extends Element {}
    `, {
        output: {
            code: `import _tmpl from "./test.html";
import { Element } from 'engine';

class Test1 extends Element {}

export default class Test2 extends Element {
  render() {
    return _tmpl;
  }

}`
        }
    })
});

describe('metadata', () => {
    pluginTest('class jsdoc single line (and declarationLoc)', `
        import { Element } from 'engine';
        /** Foo doc */
        export default class Foo extends Element {
        }
    `, {
        output: {
            metadata: {
                decorators: [],
                classMembers: [],
                declarationLoc: { start: { line: 3, column: 0 }, end: { line: 4, column: 1 }},
                doc: 'Foo doc',
            }
        }
    });

    pluginTest('class jsdoc', `
        import { Element } from 'engine';
        /**
         * Foo doc
         */
        export default class Foo extends Element {
        }
    `, {
        output: {
            metadata: {
                decorators: [],
                classMembers: [],
                declarationLoc: { end: { column: 1, line: 6 }, start: { column: 0, line: 5 } },
                doc: "Foo doc",
            }
        }
    });

    pluginTest('class jsdoc multiline', `
        import { Element } from 'engine';
        /**
         * multi
         * line
         */
        export default class Foo extends Element {
        }
    `, {
        output: {
            metadata: {
                decorators: [],
                classMembers: [],
                declarationLoc: { end: { column: 1, line: 7 }, start: { column: 0, line: 6 } },
                doc: 'multi\nline',
            }
        }
    });

    pluginTest('class jsdoc multi comments', `
        import { Element } from 'engine';
        /** first */
        /** last */
        export default class Foo extends Element {
        }
    `, {
        output: {
            metadata: {
                decorators: [],
                classMembers: [],
                declarationLoc: { end: { column: 1, line: 5 }, start: { column: 0, line: 4 } },
                doc: "last",
            },
        }
    });

    pluginTest('class jsdoc empty', `
        import { Element } from 'engine';
        /** */
        export default class Foo extends Element {
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
            }
        }
    });

    pluginTest('class no-jsdoc /**/', `
        import { Element } from 'engine';
        /* not a jsdoc */
        export default class Foo extends Element {
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
        import { Element } from 'engine';
        // not a jsdoc
        export default class Foo extends Element {
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
        import { Element } from 'engine';
        /** { one: "1", two: '2', array: [1, 2, 3]} */
        export default class Foo extends Element {
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
                doc: "{ one: \"1\", two: '2', array: [1, 2, 3]}",
            }
        }
    });

    pluginTest(
        "tooling metadata",
        `
        import { Element, api, track } from 'engine';
        // not a jsdoc
        export default class Foo extends Element {
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
                            doc: "property-comment",
                            decorator: "api"
                        },
                        {
                            type: "method",
                            name: "publicMethod",
                            loc: {
                                start: { line: 6, column: 22 },
                                end: { line: 6, column: 44 }
                            },
                            doc: "method-comment",
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
