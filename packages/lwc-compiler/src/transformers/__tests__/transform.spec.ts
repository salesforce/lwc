import { transform } from '../../transformers/transformer';
import { pretify } from '../../__tests__/utils';
import { createHash } from '../../utils';

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
});

describe('Javascript transform', () => {
    it('should apply transformation for valid javascript file', async () => {
        const actual = `
            import { LightningElement } from 'lwc';
            export default class Foo extends LightningElement {}
        `;

        const expected = `
            import _tmpl from "./foo.html";
            import { LightningElement } from 'lwc';
            export default class Foo extends LightningElement {
                render() {
                    return _tmpl;
                }
            }
        `;

        const { code } = await transform(actual, 'foo.js', {
            namespace: 'x',
            name: 'foo',
        });
        expect(pretify(code)).toBe(pretify(expected));
    });

    it('outputs proper metadata', async () => {
        const content = `
            import { LightningElement, api } from 'lwc';
            /** Foo doc */
            export default class Foo extends LightningElement {
                _privateTodo;

                @api
                get todo () {
                    return this._privateTodo;
                }
                set todo (val) {
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
                    { type: 'property', name: 'index' },
                ],
            },
        ]);
        expect(metadata.doc).toBe('* Foo doc');
        expect(metadata.declarationLoc).toEqual({
            start: { line: 4, column: 12 },
            end: { line: 17, column: 13 },
        });
    });

    it('should throw when processing an invalid javascript file', async () => {
        await expect(
            transform(`const`, 'foo.js', {
                namespace: 'x',
                name: 'foo',
            })
        ).rejects.toMatchObject({
            filename: 'foo.js',
            message: expect.stringContaining('foo.js: Unexpected token (1:5)')
        });
    });

    it('allows dynamic imports', async () => {
        const actual = `
            export function test() {
                return import('/test');
            }
        `;

        const expected = `
            export function test() {
                return import('/test');
            }
        `;

        const { code } = await transform(actual, 'foo.js', { namespace: 'x', name: 'foo' });
        expect(pretify(code)).toBe(pretify(expected));

    });
});

describe('HTML transform', () => {
    it('should apply transformation for template file', async () => {
        const actual = `
            <template>
                <div>Hello</div>
            </template>
        `;

        const expected = `
            import stylesheet from './foo.css'
            export default function tmpl($api, $cmp, $slotset, $ctx) {
            const {
            t: api_text,
            h: api_element
            } = $api;
            return [api_element(\"div\", {
            key: 1
            }, [api_text(\"Hello\")])];
            }
            if (stylesheet) {
            tmpl.hostToken = 'x-foo_foo-host';
            tmpl.shadowToken = 'x-foo_foo';
            const style = document.createElement('style');
            style.type = 'text/css';
            style.dataset.token = 'x-foo_foo'
            style.textContent = stylesheet('x-foo_foo');
            document.head.appendChild(style);
            }
        `;

        const { code } = await transform(actual, 'foo.html', {
            namespace: 'x',
            name: 'foo',
        });

        expect(pretify(code)).toBe(pretify(expected));
    });

    it('should throw when processing an invalid HTML file', async () => {
        await expect(
            transform(`<html`, 'foo.html', {
                namespace: 'x',
                name: 'foo',
            })
        ).rejects.toMatchObject({
            filename: 'foo.html',
            message: expect.stringContaining('foo.html: Invalid HTML syntax: eof-in-tag.')
        });
    });
});

describe.only('CSS transform', () => {
    it('should throw when processing an invalid CSS file', async () => {
        await expect(
            transform(`<`, 'foo.css', {
                namespace: 'x',
                name: 'foo',
            })
        ).rejects.toMatchObject({
            filename: 'foo.css',
            message: expect.stringContaining('foo.css:1:1: Unknown word')
        });
    });

    it('should apply transformation for stylesheet file', async () => {
        const actual = `
            div {
                background-color: red;
            }
        `;

        const name = 'foo';
        const namespace = 'x';

        const expected = `export default {
            hostToken: 'foo-x-19829-host',
            shadowToken: 'foo-x-19829',
            content: '
            div[foo-x-19829] {
                background-color: red;
            }
            ',
        }`;

        const { code } = await transform(actual, 'foo.css', {
            namespace,
            name,
        });

        console.log('----> code: ', code);

        expect(pretify(code)).toBe(pretify(expected));
    });

    it('should throw an error when processing a file with custom properties and allowDefinition is set to false', async () => {
        await expect(
            transform(`:host { --bg-color: red; }`, 'foo.css', {
                stylesheetConfig: {
                    customProperties: { allowDefinition: true },
                },
            })
        ).resolves.toMatchObject({
            code: expect.any(String)
        });

        await expect(transform(`:host { --bg-color: red; }`, 'foo.css', {
            stylesheetConfig: {
                customProperties: { allowDefinition: false },
            },
        })).rejects.toMatchObject({
            filename: 'foo.css',
            message: expect.stringContaining('Invalid definition of custom property "--bg-color".'),
        });
    });

    it('should not transform var functions if custom properties a resolved natively', async () => {
        const actual = `div { color: var(--bg-color); }`;

        const expected = `export default {
            hostToken: 'foo-x-02f5f-host',
            shadowToken: 'foo-x-02f5f',
            content: 'div[foo-x-02f5f] { color: var(--bg-color); }',
        }`;

        const { code } = await transform(actual, 'foo.css', {
            name: 'foo',
            namespace: 'x',
            stylesheetConfig: {
                customProperties: { resolution: { type: 'native' } },
            },
        });

        expect(pretify(code)).toBe(pretify(expected));
    });

    it('should transform var functions if custom properties a resolved via a module', async () => {
        const actual = `div {
            color: var(--bg-color);
            font-size: var(--font-size, 16px);
            margin: var(--margin-small, var(--margin-medium, 20px));
            border-bottom: 1px solid var(--lwc-border);
        }`;

        const expected = `
            import customProperties from '@customProperties';
            export default {
                hostToken: 'undefined-undefined-94e85-host',
                shadowToken: 'undefined-undefined-94e85',
                content: 'div[undefined-undefined-94e85] {
                    color: \${customProperties(\`--bg-color\`)};
                    font-size: \${customProperties(\`--font-size\`, \`16px\`)};
                    margin: \${customProperties(\`--margin-small\`, \`\${customProperties(\`--margin-medium\`, \`20px\`)}\`)};
                    border-bottom: 1px solid \${customProperties(\`--lwc-border\`)};
                }',
            }
        `;

        const { code } = await transform(actual, 'foo.css', {
            stylesheetConfig: {
                customProperties: { resolution: { type: 'module', name: '@customProperties' } },
            },
        });

        expect(pretify(code)).toBe(pretify(expected));
    });

    it('should transform var functions properly when minification is enabled', async () => {
        const actual = `div {
            color: var(--bg-color);
            font-size: var(--font-size, 16px);
            margin: var(--margin-small, var(--margin-medium, 20px));
            border-bottom: 1px solid var(--lwc-border);
        }`;

        const expected = `
            import customProperties from '@customProperties';
            export default {
                hostToken: 'foo-x-94e85-host',
                shadowToken: 'foo-x-94e85',
                content: 'div[foo-x-94e85]{color:\${customProperties(\`--bg-color\`)};font-size:\${customProperties(\`--font-size\`, \`16px\`)};margin:\${customProperties(\`--margin-small\`, \`\${customProperties(\`--margin-medium\`, \`20px\`)}\`)};border-bottom:1px solid \${customProperties(\`--lwc-border\`)}}',
            }
        `;

        const { code } = await transform(actual, 'foo.css', {
            stylesheetConfig: {
                customProperties: { resolution: { type: 'module', name: '@customProperties' } },
            },
            name: 'foo',
            namespace: 'x',
            outputConfig: {
                minify: true
            }
        });

        expect(pretify(code)).toBe(pretify(expected));
    });

    it('should escape grave accents', async () => {
        const actual = `/* Comment with grave accents \`#\` */`;
        const expected = `export default {
            hostToken: 'foo-x-30ca4-host',
            shadowToken: 'foo-x-30ca4',
            content: '/* Comment with grave accents \\\`#\\\` */',
        }
        `;

        const { code } = await transform(actual, 'foo.css', {
            namespace: 'x',
            name: 'foo',
        });

        expect(pretify(code)).toBe(pretify(expected));
    });

    it('should escape backslash', async () => {
        const actual = '.foo { content: "\\\\"; }';
        const expected = `export default {
            hostToken: 'foo-x-c09ca-host',
            shadowToken: 'foo-x-c09ca',
            content: '.foo[foo-x-c09ca] { content: "\\\\\\\\"; }',
        }
        `;

        const { code } = await transform(actual, 'foo.css', {
            namespace: 'x',
            name: 'foo',
        });

        expect(pretify(code)).toBe(pretify(expected));
    });
});
