/* eslint-env node, jest */

const { compile } = require('../index');
const { fixturePath, readFixture, pretify } = require('./utils');

describe('validate options', () => {
    it('should validate entry type', () => {
        expect(() => compile()).toThrow(/Expected a string for entry/);
    });

    it('should validate mode', () => {
        expect(() =>
            compile('/x/foo/foo.js', {
                mode: 'foo',
            }),
        ).toThrow(
            /Expected a mode in dev, prod, compat, prod_compat, all. Received instead foo/,
        );
    });

    it('should validate sources option format', () => {
        expect(() =>
            compile('/x/foo/foo.js', {
                sources: {
                    '/x/foo/foo.js': true,
                },
            }),
        ).toThrow(
            /in-memory module resolution expects values to be string. Received true for key \/x\/foo\/foo.js/,
        );
    });
});

describe('stylesheet', () => {
    it('should import the associated stylesheet by default', async () => {
        const { code } = await compile(
            fixturePath('namespaced_folder/styled/styled.js'),
        );

        expect(pretify(code)).toBe(
            pretify(readFixture('expected-styled.js')),
        );
    });

    it.skip('should import compress css in prod mode', async () => {
        const { code } = await compile(
            fixturePath('namespaced_folder/styled/styled.js'),
            {
                mode: 'prod'
            }
        );

        expect(pretify(code)).toBe(
            pretify(readFixture('expected-styled-prod.js')),
        );
    });
});

describe('component name and namespace override', () => {
    it('should be able to override module name', async () => {
        const { code } = await compile('/x/foo/foo.js', {
            componentName: 'bar',
            format: 'amd',
            mode: 'prod',
            sources: {
                '/x/foo/foo.js': `console.log('foo')`,
            },
        });

        expect(pretify(code)).toBe(
            pretify(`define("x-bar",function(){console.log("foo")});`),
        );
    });

    it('should be able to override module namespace', async () => {
        const { code } = await compile('/x/foo/foo.js', {
            componentNamespace: 'bar',
            format: 'amd',
            mode: 'prod',
            sources: {
                '/x/foo/foo.js': `console.log('foo')`,
            },
        });

        expect(pretify(code)).toBe(
            pretify(`define("bar-foo",function(){console.log("foo")});`),
        );
    });
});

describe('compile from file system', () => {
    it('compiles module with no option and default namespace', async () => {
        const { code, metadata } = await compile(
            fixturePath('namespaced_folder/default/default.js'),
        );

        expect(pretify(code)).toBe(
            pretify(
                readFixture(
                    'expected-compile-with-no-options-and-default-namespace.js',
                ),
            ),
        );

        expect(metadata).toEqual({
            decorators: [],
            references: [
                {name: 'engine', type: 'module' }
            ]
        });
    });

    it('compiles with namespace mapping', async () => {
        const { code, metadata } = await compile(
            fixturePath('namespaced_folder/ns1/cmp1/cmp1.js'),
        );

        expect(pretify(code)).toBe(
            pretify(readFixture('expected-mapping-namespace-from-path.js')),
        );

        expect(metadata).toEqual({
            decorators: [],
            references: [
                { name: 'engine', type: 'module' }
            ]
        });
    });
});

describe('compile from in-memory', () => {
    it('compiles to ESModule by deafult', async () => {
        const { code, metadata } = await compile('/x/foo/foo.js', {
            mapNamespaceFromPath: true,
            sources: {
                '/x/foo/foo.js': readFixture(
                    'class_and_template/class_and_template.js',
                ),
                '/x/foo/foo.html': readFixture(
                    'class_and_template/class_and_template.html',
                ),
            },
        });

        expect(pretify(code)).toBe(
            pretify(readFixture('expected-sources-namespaced.js')),
        );

        expect(metadata).toEqual({
            decorators: [],
            references: [
                { name: 'engine', type: 'module' }
            ]
        });
    });

    it('respects the output format', async () => {
        const { code, metadata } = await compile('/x/foo/foo.js', {
            format: 'amd',
            mapNamespaceFromPath: true,
            sources: {
                '/x/foo/foo.js': readFixture(
                    'class_and_template/class_and_template.js',
                ),
                '/x/foo/foo.html': readFixture(
                    'class_and_template/class_and_template.html',
                ),
            },
        });

        expect(pretify(code)).toBe(
            pretify(readFixture('expected-sources-namespaced-format.js')),
        );

        expect(metadata).toEqual({
            decorators: [],
            references: [
                { name: 'engine', type: 'module' }
            ]
        });
    });

    it('respects the output format', async () => {
        const {
            code,
            metadata,
        } = await compile('myns/relative_import/relative_import.js', {
            format: 'amd',
            mapNamespaceFromPath: true,
            sources: {
                'myns/relative_import/relative_import.html': readFixture(
                    'relative_import/relative_import.html',
                ),
                'myns/relative_import/relative_import.js': readFixture(
                    'relative_import/relative_import.js',
                ),
                'myns/relative_import/relative.js': readFixture(
                    'relative_import/relative.js',
                ),
                'myns/relative_import/other/relative2.js': readFixture(
                    'relative_import/other/relative2.js',
                ),
                'myns/relative_import/other/relative3.js': readFixture(
                    'relative_import/other/relative3.js',
                ),
            },
        });

        expect(pretify(code)).toBe(
            pretify(readFixture('expected-relative-import.js')),
        );

        expect(metadata).toEqual({
            decorators: [],
            references: [
                { name: 'engine', type: 'module' }
            ]
        });
    });
});

describe('mode generation', () => {
    it.skip('handles prod mode', async () => {
        const { code, metadata } = await compile(
            fixturePath('class_and_template/class_and_template.js'),
            {
                format: 'amd',
                mode: 'prod',
            },
        );

        expect(pretify(code)).toBe(
            pretify(readFixture('expected-prod-mode.js')),
        );

        expect(metadata).toEqual({
            decorators: [],
            references: [
                { name: 'engine', type: 'module' }
            ]
        });
    });

    it('handles compat mode', async () => {
        const { code, metadata } = await compile(
            fixturePath('class_and_template/class_and_template.js'),
            {
                format: 'amd',
                mode: 'compat',
            },
        );

        expect(pretify(code)).toBe(
            pretify(readFixture('expected-compat-mode.js')),
        );

        expect(metadata).toMatchObject({
            decorators: [],
            references: [
                { name: 'engine', type: 'module' }
            ]
        });
    });

    it.skip('handles prod-compat mode', async () => {
        const { code, metadata } = await compile(
            fixturePath('class_and_template/class_and_template.js'),
            {
                format: 'amd',
                mode: 'prod_compat',
            },
        );

        expect(pretify(code)).toBe(
            pretify(readFixture('expected-prod_compat-mode.js')),
        );

        expect(metadata).toEqual({
            decorators: [],
            references: [
                { name: 'engine', type: 'module' }
            ]
        });
    });

    it.skip('handles all modes', async () => {
        const res = await compile(
            fixturePath('class_and_template/class_and_template.js'),
            {
                format: 'amd',
                mode: 'all',
            },
        );

        expect(Object.keys(res)).toEqual([
            'dev',
            'prod',
            'compat',
            'prod_compat',
        ]);

        for (let mode of Object.keys(res)) {
            const { code, metadata } = res[mode];

            expect(pretify(code)).toBe(
                pretify(readFixture(`expected-${mode}-mode.js`)),
            );

            expect(metadata).toEqual({
                decorators: [],
                references: [
                    { name: 'engine', type: 'module' }
                ]
            });
        }
    });
});

describe('node env', function () {
    it('does not remove production code when no NODE_ENV option is specified', async () => {
        const previous = process.env.NODE_ENV;
        process.env.NODE_ENV = undefined;
        const { code, metadata } = await compile(
            fixturePath('node_env/node_env.js'),
            {
                mode: 'dev',
            },
        );
        process.env.NODE_ENV = previous;

        expect(pretify(code)).toBe(
            pretify(readFixture('expected-node-env-dev.js')),
        );
    });

    it('does removes production code when process.env.NODE_ENV is production', async () => {
        const previous = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        const { code, metadata } = await compile(
            fixturePath('node_env/node_env.js'),
            {
                mode: 'dev',
            },
        );
        process.env.NODE_ENV = previous;

        expect(pretify(code)).toBe(
            pretify(readFixture('expected-node-env-prod.js')),
        );
    });

    it('removes production code when NODE_ENV option is production', async () => {
        const { code, metadata } = await compile(
            fixturePath('node_env/node_env.js'),
            {
                mode: 'dev',
                env: {
                    NODE_ENV: 'production',
                }
            },
        );

        expect(pretify(code)).toBe(
            pretify(readFixture('expected-node-env-prod.js')),
        );
    });

    it('does not remove production code when in NODE_ENV option is development', async () => {
        const { code, metadata } = await compile(
            fixturePath('node_env/node_env.js'),
            {
                mode: 'dev',
                env: {
                    NODE_ENV: 'development',
                }
            },
        );

        expect(pretify(code)).toBe(
            pretify(readFixture('expected-node-env-dev.js')),
        );
    });
});

describe('metadata output', () => {
    it('decorators and references', async () => {
        const { code, metadata } = await compile('/x/foo/foo.js', {
            mapNamespaceFromPath: true,
            sources: {
                '/x/foo/foo.js': readFixture(
                    'metadata/metadata.js',
                ),
                '/x/foo/foo.html': readFixture(
                    'metadata/metadata.html',
                ),
            },
        });

        expect(pretify(code)).toBe(
            pretify(readFixture('expected-sources-metadata.js')),
        );

        expect(metadata).toEqual({
            decorators: [
                {
                    type: 'api',
                    targets: [
                        { type: 'property', name: 'publicProp' },
                        { type: 'method', name: 'publicMethod' }
                    ]
                },
                {
                    type: 'wire',
                    targets: [
                        {
                            type: 'property',
                            adapter: { name: 'getTodo', reference: 'todo' },
                            name: 'wiredProp',
                            params: {},
                            static: {}
                        },
                        {
                            type: 'method',
                            adapter: { name: 'getHello', reference: '@schema/foo.bar' },
                            name: 'wiredMethod',
                            params: { name: 'publicProp' },
                            static: { 'fields': ['one', 'two'] }
                        }
                    ]
                }
            ],
            references: [
                { name: 'x-bar', type: 'component' },
                { name: 'engine', type: 'module' },
                { name: 'todo', type: 'module' },
                { name: '@schema/foo.bar', type: 'module' }
            ]
        });
    });
});
