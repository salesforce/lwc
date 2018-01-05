const plugin = require('../index');
const transformUtil = require('./utils/test-transform')

const transform = transformUtil.transform(plugin);
const test = transformUtil.test(plugin);

describe('labels', () => {
    test('remove labels from the class body', `
        import { Element } from 'engine';

        export default class Test extends Element {
            static labels = ['foo', 'bar']
        }
    `, `
        import _tmpl from './test.html';
        import { Element } from 'engine';

        export default class Test extends Element {
            render() {
                return _tmpl;
            }

        }
        Test.style = _tmpl.style;
    `);

    it('returns labels as metadata', () => {
        const { metadata } = transform(`
            import { Element } from 'engine';

            export default class Test extends Element {
                static labels = ['foo', 'bar']
            }
        `);

        expect(metadata.labels).toEqual(['foo', 'bar']);
    });

    test('throws if the label property is not an array of strings', `
        import { Element } from 'engine';

        const STATIC_LABELS = ['foo', 'bar'];

        export default class Test extends Element {
            static labels = STATIC_LABELS;
        }
    `, undefined, {
        message: 'test.js: "labels" static class property should be an array of string',
        loc: {
            line: 6,
            column: 4,
        },
    });

    test('throws if labels are not strings', `
        import { Element } from 'engine';

        export default class Test extends Element {
            static labels = [true];
        }
    `, undefined, {
        message: 'test.js: Label is expected to a be string, but found BooleanLiteral',
        loc: {
            line: 4,
            column: 21,
        },
    });
});
