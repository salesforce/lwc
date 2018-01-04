const test = require('./utils/test-transform').test(
    require('../index')
);

describe('Element import', () => {
    test('throw an error if the component class is anonymous', `
        import { Element } from 'engine';

        export default class extends Element {}
    `, undefined, {
        message: `test.js: Raptor component class can't be an anonymous.`,
        loc: {
            line: 3,
            column: 15
        }
    });

    test('allow to remap the import to Element', `
        import { Element as Component } from 'engine';

        export default class Test extends Component {}
    `, `
        import _tmpl from './test.html';
        import { Element as Component } from 'engine';

        export default class Test extends Component {
          render() {
            return _tmpl;
          }

        }
        Test.style = _tmpl.style;
    `);
});

describe('render method', () => {
    test('inject render method', `
        import { Element } from "engine";
        export default class Test extends Element {}
    `, `
        import _tmpl from "./test.html";
        import { Element } from "engine";
        export default class Test extends Element {
          render() {
            return _tmpl;
          }

        }
        Test.style = _tmpl.style;
    `);

    test(`keep the render method if present`, `
        import { Element } from "engine";
        export default class Test extends Element {
            render() {}
        }
    `, `
        import { Element } from "engine";
        export default class Test extends Element {
            render() {}
        }
    `);

    test('only inject render in the exported class', `
        import { Element } from 'engine';

        class Test1 extends Element {}

        export default class Test2 extends Element {}
    `, `
        import _tmpl from './test.html';
        import { Element } from 'engine';

        class Test1 extends Element {}

        export default class Test2 extends Element {
          render() {
            return _tmpl;
          }

        }
        Test2.style = _tmpl.style;
    `)
});
