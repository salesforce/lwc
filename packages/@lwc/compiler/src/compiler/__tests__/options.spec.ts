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
            message: expect.stringContaining('Expected a string for namespace, received "undefined".'),
        });
    });

    it('should validate presence of files option', async () => {
        await expect(
            compile({
                name: '/x/foo/foo.js',
                namespace: 'x',
                files: {},
            }),
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
            }),
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
            }),
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
            }),
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
            }),
        ).rejects.toMatchObject({
            message: expect.stringContaining(
                "Expected a boolean value for outputConfig.sourcemap, received \"true\"."
            ),
        });
    });

    it('should validate stylesheetConfig.customProperties.allowDefinition', async () => {
        await expect(
            compile({
                name: 'foo',
                namespace: 'x',
                files: { x: 'foo' },
                stylesheetConfig: {
                    customProperties: {
                        allowDefinition: 'foo',
                    },
                },
            }),
        ).rejects.toMatchObject({
            message: expect.stringContaining(
                'Expected a boolean for stylesheetConfig.customProperties.allowDefinition, received "foo".'
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
            }),
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
            }),
        ).rejects.toMatchObject({
            message: expect.stringContaining(
                'Expected either "native" or "module" for stylesheetConfig.customProperties.resolution.type, received "foo".'
            ),
        });
    });

    describe('entry + filenames case validation', () => {

        describe('bundle entry name casing validation', () => {
            it('should fail validation if entry name has a leading uppercase character', async () => {
                await expect(compile({
                    name: 'Mycmp',
                    namespace: 'c',
                    files: {
                        'mycmp.js': ``,
                        'mycmp.html': ``,
                    },
                })).rejects.toMatchObject({
                    message: expect.stringContaining('Illegal entry name "Mycmp". An entry must start with a lowercase character.'),
                });
            });

            it('should fail validation if entry name has a leading uppercase character and a .js extension', async () => {
                await expect(compile({
                    name: 'Mycmp.js',
                    namespace: 'c',
                    files: {
                        'mycmp.js': ``,
                        'mycmp.html': ``,
                    },
                })).rejects.toMatchObject({
                    message: expect.stringContaining('Illegal entry name "Mycmp.js". An entry must start with a lowercase character.'),
                });
            });

            it('should fail validation if nested path entry name has a leading uppercase character', async () => {
                await expect(compile({
                    name: 'lwc/myapp/Mycmp',
                    namespace: 'c',
                    files: {
                        'mycmp.js': ``,
                        'mycmp.html': ``,
                    },
                })).rejects.toMatchObject({
                    message: expect.stringContaining('Illegal entry name "lwc/myapp/Mycmp". An entry must start with a lowercase character.'),
                });
            });

            it('should pass validation if entry name contains non-leading uppercase character', async () => {
                const { diagnostics, success } = await compile({
                    name: 'myCmp',
                    namespace: 'c',
                    files: {
                        'myCmp.js': ``,
                        'myCmp.html': ``,
                    },
                });
                expect(success).toBe(true);
            });
        });

        describe('bundle file name casing validation', () => {
            it('should pass validation if bundle contains an uppercase file name that is different from its entry', async () => {
                const { success } = await compile({
                    name: 'myCmp',
                    namespace: 'c',
                    files: {
                        'myCmp.js': ``,
                        'myCmp.html': ``,
                        'Utils.js': ``,
                    },
                });
                expect(success).toBe(true);
            });

            it ('should pass validation if .js file has the wrong casing but is located in a subdirectory', async () => {
                const { success } = await compile({
                    name: 'myCmp',
                    namespace: 'c',
                    files: {
                        'myCmp.js': ``,
                        'myCmp.html': ``,
                        './subdirectory/MyCmp.js': ``,
                    },
                });
                expect(success).toBe(true);
            });

            it('should fail validation if bundle .js file name does not match the entry name casing', async () => {
                await expect(compile({
                    name: 'mycmp',
                    namespace: 'c',
                    files: {
                        'Mycmp.js': ``,
                        'mycmp.html': ``,
                    },
                })).rejects.toMatchObject({
                    message: expect.stringContaining('Unexpected case mismatch. Component file name "Mycmp.js" must match the entry name "mycmp.js".'),
                });
            });

            it ('should not validate .html file name with the same name as entry', async () => {
                const { success } = await compile({
                    name: 'myCmp',
                    namespace: 'c',
                    files: {
                        'myCmp.js': ``,
                        'MyCmp.html': ``,
                    },
                });
                expect(success).toBe(true);
            });

            it ('should not validate .css file name', async () => {
                const { success } = await compile({
                    name: 'myCmp',
                    namespace: 'c',
                    files: {
                        'myCmp.js': ``,
                        'myCmp.html': ``,
                        'MyCmp.css': ``,
                    },
                });
                expect(success).toBe(true);
            });
        });
    });
});
