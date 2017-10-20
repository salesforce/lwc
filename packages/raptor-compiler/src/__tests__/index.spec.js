/* eslint-env node, jest */

const fs = require('fs');
const path = require('path');

const { compile } = require('../index');
const { fixturePath, readFixture, pretify } = require('./test-utils');

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
            pretify(`define('x-bar',function(){console.log('foo')});`),
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
            pretify(`define('bar-foo',function(){console.log('foo')});`),
        );
    });
});

describe('compile from file system', () => {
    it('compiles module with no option and namespace', async () => {
        const { code, metadata } = await compile(
            fixturePath('namespaced_folder/custom/foo-bar.js'),
        );

        expect(pretify(code)).toMatch(
            pretify(
                readFixture(
                    'expected-compile-with-no-options-and-no-namespace.js',
                ),
            ),
        );

        expect(metadata).toMatchObject({
            bundleDependencies: ['engine'],
            bundleLabels: [],
        });
    });

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

        expect(metadata).toMatchObject({
            bundleDependencies: ['engine'],
            bundleLabels: [],
        });
    });

    it('compiles with namespace mapping', async () => {
        const { code, metadata } = await compile(
            fixturePath('namespaced_folder/ns1/cmp1/cmp1.js'),
        );

        expect(pretify(code)).toBe(
            pretify(readFixture('expected-mapping-namespace-from-path.js')),
        );

        expect(metadata).toMatchObject({
            bundleDependencies: ['engine'],
            bundleLabels: [],
        });
    });
});

describe('compile from in-memory', () => {
    it('add external dependencies and labels to the metadata bag', async () => {
        const { code, metadata } = await compile('/x/external/external.js', {
            mapNamespaceFromPath: true,
            sources: {
                '/x/external/external.js': readFixture(
                    'namespaced_folder/external/external.js',
                ),
                '/x/external/external.html': readFixture(
                    'namespaced_folder/external/external.html',
                ),
            },
        });

        expect(pretify(code)).toBe(
            pretify(readFixture('expected-external-dependency.js')),
        );

        expect(metadata).toMatchObject({
            bundleDependencies: ['engine', 'another-module'],
            bundleLabels: ['test-label'],
        });
    });

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

        expect(metadata).toMatchObject({
            bundleDependencies: ['engine'],
            bundleLabels: [],
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

        expect(metadata).toMatchObject({
            bundleDependencies: ['engine'],
            bundleLabels: [],
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

        expect(metadata).toMatchObject({
            bundleDependencies: ['engine'],
            bundleLabels: [],
        });
    });
});

describe('mode generation', () => {
    it('handles prod mode', async () => {
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

        expect(metadata).toMatchObject({
            bundleDependencies: ['engine'],
            bundleLabels: [],
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
            bundleDependencies: ['engine'],
            bundleLabels: [],
        });
    });

    it('handles prod-compat mode', async () => {
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

        expect(metadata).toMatchObject({
            bundleDependencies: ['engine'],
            bundleLabels: [],
        });
    });

    it('handles all modes', async () => {
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

            expect(metadata).toMatchObject({
                bundleDependencies: ['engine'],
                bundleLabels: [],
            });
        }
    });
});
