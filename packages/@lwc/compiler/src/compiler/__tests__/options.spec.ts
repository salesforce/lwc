/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compile } from '../compiler';

describe('compiler options', () => {
    it('should validate presence of options', async () => {
        await expect(compile()).rejects.toMatchObject({
            message: expect.stringContaining('Expected options object, received "undefined".'),
        });
    });

    it('should validate bundle name option', async () => {
        await expect(compile({})).rejects.toMatchObject({
            message: expect.stringContaining('Expected a string for name, received "undefined".'),
        });
    });

    it('should validate bundle namespace option', async () => {
        await expect(compile({ name: 'foo' })).rejects.toMatchObject({
            message: expect.stringContaining(
                'Expected a string for namespace, received "undefined".'
            ),
        });
    });

    it('should validate presence of files option', async () => {
        await expect(
            compile({
                name: '/x/foo/foo.js',
                namespace: 'x',
                files: {},
            })
        ).rejects.toMatchObject({
            message: expect.stringContaining('Expected an object with files to be compiled.'),
        });
    });

    it('should validate files option value type', async () => {
        await expect(
            compile({
                name: 'foo',
                namespace: 'x',
                files: {
                    'foo.js': true,
                },
            })
        ).rejects.toMatchObject({
            message: expect.stringContaining(
                'Unexpected file content for "foo.js". Expected a string, received "true".'
            ),
        });
    });

    it('should validate outputConfig.minify', async () => {
        await expect(
            compile({
                name: 'foo',
                namespace: 'x',
                files: { x: 'foo' },
                outputConfig: {
                    minify: 'true',
                },
            })
        ).rejects.toMatchObject({
            message: expect.stringContaining(
                'Expected a boolean for outputConfig.minify, received "true".'
            ),
        });
    });

    it('should validate outputConfig.compat', async () => {
        await expect(
            compile({
                name: 'foo',
                namespace: 'x',
                files: { x: 'foo' },
                outputConfig: {
                    compat: 'true',
                },
            })
        ).rejects.toMatchObject({
            message: expect.stringContaining(
                'Expected a boolean for outputConfig.compat, received "true".'
            ),
        });
    });

    it('should validate outputConfig.sourcemap', async () => {
        await expect(
            compile({
                name: 'foo',
                namespace: 'x',
                files: { x: 'foo' },
                outputConfig: {
                    sourcemap: 'true',
                },
            })
        ).rejects.toMatchObject({
            message: expect.stringContaining(
                'Expected a boolean value for outputConfig.sourcemap, received "true".'
            ),
        });
    });

    it('should validate stylesheetConfig.customProperties.resolution', async () => {
        await expect(
            compile({
                name: 'foo',
                namespace: 'x',
                files: { x: 'foo' },
                stylesheetConfig: {
                    customProperties: {
                        resolution: true,
                    },
                },
            })
        ).rejects.toMatchObject({
            message: expect.stringContaining(
                'Expected an object for stylesheetConfig.customProperties.resolution, received "true".'
            ),
        });
    });

    it('should validate stylesheetConfig.customProperties.resolution.type', async () => {
        await expect(
            compile({
                name: 'foo',
                namespace: 'x',
                files: { x: 'foo' },
                stylesheetConfig: {
                    customProperties: {
                        resolution: { type: 'foo' },
                    },
                },
            })
        ).rejects.toMatchObject({
            message: expect.stringContaining(
                'Expected either "native" or "module" for stylesheetConfig.customProperties.resolution.type, received "foo".'
            ),
        });
    });
});
