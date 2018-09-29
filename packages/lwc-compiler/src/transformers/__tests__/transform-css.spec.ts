import { CompilerOptions } from '../../compiler/options';
import { transform } from '../transformer';

import { pretify } from '../../__tests__/utils';

const COMPILER_OPTIONS: CompilerOptions = {
    namespace: 'x',
    name: 'foo',
    files: {},
};

it('should throw when processing an invalid CSS file', async () => {
    await expect(
        transform(`<`, 'foo.css', COMPILER_OPTIONS),
    ).rejects.toMatchObject({
        filename: 'foo.css',
        message: expect.stringContaining('foo.css:1:1: Unknown word'),
    });
});

it('should apply transformation for stylesheet file', async () => {
    const actual = `
        :host {
            color: red;
        }

        div {
            background-color: red;
        }
    `;

    const expected = `
        function factory(hostSelector, shadowSelector) {
            return \`
                :host {
                    color: red;
                }

                \${hostSelector} {
                    color: red;
                }

                div\${shadowSelector} {
                    background-color: red;
                }
            \`;
        }

        export default {
            factory,
            hostAttribute: 'x-foo_foo-host',
            shadowAttribute: 'x-foo_foo',
        };
    `;

    const { code } = await transform(actual, 'foo.css', COMPILER_OPTIONS);
    expect(pretify(code)).toBe(pretify(expected));
});

describe('custom properties', () => {
    it('should allow custom properties if allowDefinition is true', async () => {
        await expect(
            transform(`:host { --bg-color: red; }`, 'foo.css', {
                ...COMPILER_OPTIONS,
                stylesheetConfig: {
                    customProperties: { allowDefinition: true },
                },
            }),
        ).resolves.toMatchObject({
            code: expect.any(String),
        });
    });

    it('should throw if custom properties are defined and allowDefinition is false', async () => {
        await expect(
            transform(`:host { --bg-color: red; }`, 'foo.css', {
                ...COMPILER_OPTIONS,
                stylesheetConfig: {
                    customProperties: { allowDefinition: false },
                },
            }),
        ).rejects.toMatchObject({
            filename: 'foo.css',
            message: expect.stringContaining(
                'Invalid definition of custom property "--bg-color".',
            ),
        });
    });

    it('should not transform var functions if custom properties a resolved natively', async () => {
        const actual = `div { color: var(--bg-color); }`;
        const expected = `
            function factory(hostSelector, shadowSelector) {
                return \`div\${shadowSelector} { color: var(--bg-color); }\`;
            }

            export default {
                factory,
                hostAttribute: 'x-foo_foo-host',
                shadowAttribute: 'x-foo_foo',
            };
        `;

        const { code } = await transform(actual, 'foo.css', {
            ...COMPILER_OPTIONS,
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

            function factory(hostSelector, shadowSelector) {
                return \`div\${shadowSelector} {
                    color: \${customProperties(\`--bg-color\`)};
                    font-size: \${customProperties(\`--font-size\`, \`16px\`)};
                    margin: \${customProperties(\`--margin-small\`, \`\${customProperties(\`--margin-medium\`, \`20px\`)}\`)};
                    border-bottom: 1px solid \${customProperties(\`--lwc-border\`)};
                }\`;
            }

            export default {
                factory,
                hostAttribute: 'x-foo_foo-host',
                shadowAttribute: 'x-foo_foo',
            };
        `;

        const { code } = await transform(actual, 'foo.css', {
            ...COMPILER_OPTIONS,
            stylesheetConfig: {
                customProperties: {
                    resolution: { type: 'module', name: '@customProperties' },
                },
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

            function factory(hostSelector, shadowSelector) {
                return \`div\${shadowSelector}{color:\${customProperties(\`--bg-color\`)};font-size:\${customProperties(\`--font-size\`, \`16px\`)};margin:\${customProperties(\`--margin-small\`, \`\${customProperties(\`--margin-medium\`, \`20px\`)}\`)};border-bottom:1px solid \${customProperties(\`--lwc-border\`)}}\`;
            }

            export default {
                factory,
                hostAttribute: 'x-foo_foo-host',
                shadowAttribute: 'x-foo_foo',
            };
        `;

        const { code } = await transform(actual, 'foo.css', {
            ...COMPILER_OPTIONS,
            stylesheetConfig: {
                customProperties: {
                    resolution: { type: 'module', name: '@customProperties' },
                },
            },
            outputConfig: {
                minify: true,
            },
        });

        expect(pretify(code)).toBe(pretify(expected));
    });
});

describe('regressions', () => {
    it('should escape grave accents', async () => {
        const actual = `/* Comment with grave accents \`#\` */`;
        const expected = `
            function factory(hostSelector, shadowSelector) {
                return \`/* Comment with grave accents \\\`#\\\` */\`;
            }

            export default {
                factory,
                hostAttribute: 'x-foo_foo-host',
                shadowAttribute: 'x-foo_foo',
            };
        `;

        const { code } = await transform(actual, 'foo.css', COMPILER_OPTIONS);
        expect(pretify(code)).toBe(pretify(expected));
    });

    it('should escape backslash', async () => {
        const actual = '.foo { content: "\\\\"; }';
        const expected = `
            function factory(hostSelector, shadowSelector) {
                return \`.foo\${shadowSelector} { content: "\\\\\\\\"; }\`;
            }

            export default {
                factory,
                hostAttribute: 'x-foo_foo-host',
                shadowAttribute: 'x-foo_foo',
            };
        `;

        const { code } = await transform(actual, 'foo.css', COMPILER_OPTIONS);
        expect(pretify(code)).toBe(pretify(expected));
    });

    it('#689 - should not transform z-index in production', async () => {
        const actual = 'h1 { z-index: 100; } h2 { z-index: 500; }';

        const { code } = await transform(actual, 'foo.css', {
            ...COMPILER_OPTIONS,
            outputConfig: {
                minify: true,
            },
        });

        expect(code).toContain('z-index:100');
        expect(code).toContain('z-index:500');
    });
});
