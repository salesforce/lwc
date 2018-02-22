/* eslint-env node, jest */

const { compile } = require('../index');
const { transform } = require('../transformers/transformer');
const { pretify } = require('./utils');

const VALID_TEST_JS = `
import label from '@label/mylabel';
function isTrue() {
    return label;
}
isTrue();
`.trim();

describe('compile', () => {
    it('should validate sources option format', async () => {
        expect.assertions(1);
        const result = await compile({
            name: '/x/foo/foo.js',
            namespace: 'x',
            files: {},
        });
        expect(result.diagnostics[0].message).toBe(
            'Could not resolve \'/x/foo/foo.js\' from \'undefined\''
        );

    });
});

describe('transform', () => {
    it('should validate presence of src', () => {
        expect(() => transform()).toThrow(
            /Expect a string for source. Received undefined/,
        );
    });

    it('should validate presence of id', () => {
        expect(() => transform(`console.log('Hello')`)).toThrow(
            /Expect a string for id. Received undefined/,
        );
    });

    it('should apply transformation for javascript file', async () => {
        const actual = `
            import { Element } from 'engine';
            export default class Foo extends Element {}
        `;

        const expected = `
            import _tmpl from './foo.html';
            import { Element } from 'engine';
            export default class Foo extends Element {
                render() {
                    return _tmpl;
                }
            }
            Foo.style = _tmpl.style;
        `;

        const { code } = await transform(actual, 'foo.js', {
            namespace: 'x',
            name: 'foo',
        });

        expect(pretify(code)).toBe(pretify(expected));
    });

    it('should apply transformation for template file', async () => {
        const actual = `
            <template>
                <div>Hello</div>
            </template>
        `;

        const expected = `
            import style from './foo.css'

            export default function tmpl($api, $cmp, $slotset, $ctx) {
                const {
                    t: api_text,
                    h: api_element
                } = $api;

                return [api_element("div", {
                    key: 1
                }, [api_text("Hello")])];
            }

            if (style) {
                const tagName = 'x-foo';
                const token = 'x-foo_foo';
                tmpl.token = token;
                tmpl.style = style(tagName, token);
            }
        `;

        const { code } = await transform(actual, 'foo.html', {
            namespace: 'x',
            name: 'foo',
        });

        expect(pretify(code)).toBe(pretify(expected));
    });

    it('should apply transformation for stylesheet file', async () => {
        const actual = `
            div {
                background-color: red;
            }
        `;

        const expected = `
            function style(tagName, token) {
                return \`
            div[\${token}] {
                background-color: red;
            }
                \`;
            }
            export default style;
        `;

        const { code } = await transform(actual, 'foo.css', {
            namespace: 'x',
            name: 'foo',
        });

        expect(pretify(code)).toBe(pretify(expected));
    });

    it('javascript metadata', async () => {
        const content = `
            import { Element, api } from 'engine';
            /** Foo doc */
            export default class Foo extends Element {
                _privateTodo;
                @api get todo () {
                    return this._privateTodo;
                }
                @api set todo (val) {
                    return this._privateTodo = val;
                }
                @api
                index;
            }
        `;

        const result = await transform(content, 'foo.js', {
            namespace: 'x',
            name: 'foo',
        });
        const metadata = result.metadata;
        expect(metadata.decorators).toEqual([
            {
                type: 'api',
                targets: [
                    { type: 'property', name: 'todo' },
                    { type: 'property', name: 'index' }
                ]
            }
        ]);
        expect(metadata.doc).toBe('Foo doc');
        expect(metadata.declarationLoc).toEqual({ start: { line: 4, column: 12 }, end: { line: 14, column: 13 } });
    });
});
