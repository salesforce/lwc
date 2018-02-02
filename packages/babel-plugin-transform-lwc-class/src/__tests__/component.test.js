const pluginTest = require('./utils/test-transform').pluginTest(
    require('../index')
);

describe('Element import', () => {
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
            code: `
                import _tmpl from './test.html';
                import { Element as Component } from 'engine';

                export default class Test extends Component {
                render() {
                    return _tmpl;
                }

                }
                Test.style = _tmpl.style;
            `
        }
    });
});

describe('render method', () => {
    pluginTest('inject render method', `
        import { Element } from "engine";
        export default class Test extends Element {}
    `, {
        output: {
            code: `
                import _tmpl from "./test.html";
                import { Element } from "engine";
                export default class Test extends Element {
                render() {
                    return _tmpl;
                }

                }
                Test.style = _tmpl.style;
            `
        }
    });

    pluginTest(`keep the render method if present`, `
        import { Element } from "engine";
        export default class Test extends Element {
            render() {}
        }
    `, {
        output: {
            code: `
                import { Element } from "engine";
                export default class Test extends Element {
                    render() {}
                }
            `
        }
    });

    pluginTest('only inject render in the exported class', `
        import { Element } from 'engine';

        class Test1 extends Element {}

        export default class Test2 extends Element {}
    `, {
        output: {
            code: `
                import _tmpl from './test.html';
                import { Element } from 'engine';

                class Test1 extends Element {}

                export default class Test2 extends Element {
                    render() {
                        return _tmpl;
                    }

                }
                Test2.style = _tmpl.style;
            `
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
                doc: 'Foo doc', declarationLoc: { start: { line: 3, column: 0 }, end: { line: 4, column: 1 }}
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
                doc: 'Foo doc'
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
                doc: 'multi\nline'
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
                doc: 'last'
            }
        }
    });

    pluginTest('class jsdoc empty', `
        import { Element } from 'engine';
        /** */
        export default class Foo extends Element {
        }
    `, {
        output: {
            metadata: {}
        }
    });

    pluginTest('class no-jsdoc /**/', `
        import { Element } from 'engine';
        /* not a jsdoc */
        export default class Foo extends Element {
        }
    `, {
        output: {
            metadata: {}
        }
    });

    pluginTest('class no-jsdoc //', `
        import { Element } from 'engine';
        // not a jsdoc
        export default class Foo extends Element {
        }
    `, {
        output: {
            metadata: {}
        }
    });
});
