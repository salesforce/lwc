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
            code: `import _tmpl from './test.html';
import { Element as Component } from 'engine';
export default class Test extends Component {
  render() {
    return _tmpl;
  }

}
Test.style = _tmpl.style;`
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

}
Test.style = _tmpl.style;`
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
            code: `import _tmpl from './test.html';
import { Element } from 'engine';
class Test1 extends Element {}
export default class Test2 extends Element {
  render() {
    return _tmpl;
  }

}
Test2.style = _tmpl.style;`
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
                declarationLoc: { start: { line: 3, column: 0 }, end: { line: 4, column: 1 }},
                doc: 'Foo doc',
                marked: [],
                modules: {
                    exports: { exported: ['Foo'], specifiers: [{ exported: "default", kind: "local", local: "Foo" }] },
                    imports: [{ imported: ['Element'], source: 'engine', specifiers: [{ imported: 'Element', kind: 'named', local: 'Element' }] }]
                },
                usedHelpers: []
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
                declarationLoc: { end: { column: 1, line: 6 }, start: { column: 0, line: 5 } },
                doc: "Foo doc",
                marked: [],
                modules: {
                    exports: { exported: ['Foo'], specifiers: [{ exported: "default", kind: "local", local: "Foo" }] },
                    imports: [{ imported: ['Element'], source: 'engine', specifiers: [{ imported: 'Element', kind: 'named', local: 'Element' }] }]
                },
                usedHelpers: []
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
                declarationLoc: { end: { column: 1, line: 7 }, start: { column: 0, line: 6 } },
                doc: 'multi\nline',
                marked: [],
                modules: {
                    exports: { exported: ['Foo'], specifiers: [{ exported: "default", kind: "local", local: "Foo" }] },
                    imports: [{ imported: ['Element'], source: 'engine', specifiers: [{ imported: 'Element', kind: 'named', local: 'Element' }] }]
                },
                usedHelpers: []
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
                declarationLoc: { end: { column: 1, line: 5 }, start: { column: 0, line: 4 } },
                doc: "last",
                marked: [],
                modules: {
                    exports: { exported: ['Foo'], specifiers: [{ exported: "default", kind: "local", local: "Foo" }] },
                    imports: [{ imported: ['Element'], source: 'engine', specifiers: [{ imported: 'Element', kind: 'named', local: 'Element' }] }]
                },
                usedHelpers: []
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
                declarationLoc: {
                    end: { column: 1, line: 4 },
                    start: { column: 0, line: 3 }
                },
                marked: [],
                modules: {
                    exports: { exported: ['Foo'], specifiers: [{ exported: "default", kind: "local", local: "Foo" }] },
                    imports: [{ imported: ['Element'], source: 'engine', specifiers: [{ imported: 'Element', kind: 'named', local: 'Element' }] }]
                },
                usedHelpers: []
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
                declarationLoc: {
                    end: { column: 1, line: 4 },
                    start: { column: 0, line: 3 }
                },
                marked: [],
                modules: {
                    exports: { exported: ['Foo'], specifiers: [{ exported: "default", kind: "local", local: "Foo" }] },
                    imports: [{ imported: ['Element'], source: 'engine', specifiers: [{ imported: 'Element', kind: 'named', local: 'Element' }] }]
                },
                usedHelpers: []
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
                declarationLoc: {
                    end: { column: 1, line: 4 },
                    start: { column: 0, line: 3 }
                },
                marked: [],
                modules: {
                    exports: { exported: ['Foo'], specifiers: [{ exported: "default", kind: "local", local: "Foo" }] },
                    imports: [{ imported: ['Element'], source: 'engine', specifiers: [{ imported: 'Element', kind: 'named', local: 'Element' }] }]
                },
                usedHelpers: []
            }
        }
    });
});
