/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { SourceMapConsumer } from 'source-map';
import { compile } from '../compiler';
import { readFixture } from '../../__tests__/utils';
import { DiagnosticLevel } from '@lwc/errors';

const VALID_CONFIG = {
    outputConfig: {
        env: {},
        minify: false,
        compat: false,
        format: 'amd',
    },
    name: 'class_and_template',
    namespace: 'x',
    files: {
        'class_and_template.js': readFixture('class_and_template/class_and_template.js'),
        'class_and_template.html': readFixture('class_and_template/class_and_template.html'),
    },
};

describe('compiler result', () => {
    test('compiler should return bundle result default output configuration ', async () => {
        const noOutputConfig = { ...VALID_CONFIG, outputConfig: undefined };
        const {
            result: { outputConfig },
        } = await compile(noOutputConfig);
        expect(outputConfig).toMatchObject({
            env: {},
            minify: false,
            compat: false,
        });
    });
    test('compiler should return bundle result with normalized PROD output config', async () => {
        const config = Object.assign({}, VALID_CONFIG, {
            outputConfig: {
                minify: true,
                compat: false,
                env: {
                    NODE_ENV: 'production',
                },
            },
        });
        const {
            result: { outputConfig },
        } = await compile(config);
        expect(outputConfig).toMatchObject({
            env: {
                NODE_ENV: 'production',
            },
            minify: true,
            compat: false,
        });
    });
    test('compiler should return bundle result with normalized COMPAT output config', async () => {
        const config = Object.assign({}, VALID_CONFIG, {
            outputConfig: {
                minify: false,
                compat: true,
            },
        });
        const {
            result: { outputConfig },
        } = await compile(config);
        expect(outputConfig).toMatchObject({
            env: {},
            minify: false,
            compat: true,
        });
    });
    test('compiler should return bundle result with normalized PROD_COMPAT output config', async () => {
        const config = Object.assign({}, VALID_CONFIG, {
            outputConfig: {
                minify: false,
                compat: true,
                env: {
                    NODE_ENV: 'production',
                },
            },
        });
        const {
            result: { outputConfig },
        } = await compile(config);
        expect(outputConfig).toMatchObject({
            env: {
                NODE_ENV: 'production',
            },
            minify: false,
            compat: true,
        });
    });
    test('should return output object with expected properties', async () => {
        const output = await compile(VALID_CONFIG);
        const { success, diagnostics, result, version } = output;
        const { code } = result;

        expect(code).toBeDefined();
        expect(diagnostics).toBeDefined();
        expect(version).toBeDefined();
        expect(success).toBeDefined();
    });

    test('should compile sources nested inside component subfolders', async () => {
        const { success } = await compile({
            name: 'foo',
            namespace: 'x',
            files: {
                'foo.js': `import { LightningElement } from 'lwc';
                import { main } from './utils/util.js';
                export default class Test extends LightningElement {
                    get myimport() {
                        return main();
                    }
                }
                `,
                'foo.html': `<template><x-bar></x-bar></template>`,
                'utils/util.js': `export function main() { return 'here is your import'; }`,
            },
        });
        expect(success).toBe(true);
    });

    test('compiler returns diagnostic errors when module resolution encounters an error', async () => {
        const config = {
            name: 'foo',
            namespace: 'x',
            files: {
                'foo.js': `import something from './nothing';`,
            },
        };
        const { success, diagnostics } = await compile(config);
        expect(success).toBe(false);
        expect(diagnostics.length).toBe(1);

        const { level, message, code } = diagnostics[0];

        expect(level).toBe(DiagnosticLevel.Fatal);
        expect(message).toContain(
            'Failed to resolve import "./nothing" from "foo.js". Please add "nothing" file to the component folder.'
        );
        expect(code).toBe(1011);
    });

    test('compiler returns diagnostic errors when transformation encounters an error in javascript', async () => {
        const config = {
            name: 'foo',
            namespace: 'x',
            files: {
                'foo.js': `throw`,
            },
        };
        const { success, diagnostics } = await compile(config);

        expect(success).toBe(false);
        expect(diagnostics.length).toBe(1);

        const { level, message } = diagnostics[0];

        expect(level).toBe(DiagnosticLevel.Fatal);
        expect(message).toContain('Unexpected token (1:5)');
    });

    test('compiler returns diagnostic errors when transformation encounters an error in css', async () => {
        const config = {
            name: 'foo',
            namespace: 'x',
            files: {
                'foo.js': `import { LightningElement } from 'lwc';
                export default class Test extends LightningElement {}
                `,
                'foo.html': `<template></template>`,
                'foo.css': `a {`,
            },
        };
        const { success, diagnostics } = await compile(config);

        expect(success).toBe(false);
        expect(diagnostics).toMatchObject([
            {
                level: DiagnosticLevel.Fatal,
                message: expect.stringContaining('Unclosed block'),
            },
        ]);
    });

    test('compiler returns diagnostic errors when transformation encounters an error in html', async () => {
        const config = {
            name: 'foo',
            namespace: 'x',
            files: {
                'foo.js': `import { LightningElement } from 'lwc';
                export default class Test extends LightningElement {}
                `,
                'foo.html': `<template>`,
            },
        };
        const { success, diagnostics } = await compile(config);

        expect(success).toBe(false);
        expect(diagnostics).toMatchObject([
            {
                level: DiagnosticLevel.Fatal,
                message: expect.stringContaining('<template> has no matching closing tag.'),
            },
        ]);
    });

    test('sourcemaps correctness', async () => {
        const tplCode = '<template></template>';
        const cmpCode = `import { LightningElement } from 'lwc';
import { main } from './utils/util.js';
export default class Test extends LightningElement {
  get myimport() {
    return main();
  }
}
`;
        const utilsCode = `export function main() {
  return 'here is your import';
}`;
        const { result } = await compile({
            name: 'foo',
            namespace: 'x',
            files: {
                'foo.js': cmpCode,
                'foo.html': tplCode,
                'utils/util.js': utilsCode,
            },
            outputConfig: {
                sourcemap: true,
            },
        });

        await SourceMapConsumer.with(result!.map, null, (sourceMapConsumer) => {
            const mainDefMappedToOutputPosition = sourceMapConsumer.generatedPositionFor({
                source: 'utils/util.js',
                line: 1,
                column: 16,
            });

            expect(mainDefMappedToOutputPosition).toMatchObject({
                line: 14,
                column: 15,
            });

            const stringConstantInOutputPosition = sourceMapConsumer.generatedPositionFor({
                source: 'utils/util.js',
                line: 2,
                column: 9,
            });

            expect(stringConstantInOutputPosition).toMatchObject({
                line: 15,
                column: 32,
            });

            const myimportDefinitionOutputPosition = sourceMapConsumer.generatedPositionFor({
                source: 'foo.js',
                line: 4,
                column: 6,
            });

            expect(myimportDefinitionOutputPosition).toMatchObject({
                line: 19,
                column: 16,
            });

            const mainInvocationInOutputPosition = sourceMapConsumer.generatedPositionFor({
                source: 'foo.js',
                line: 5,
                column: 15,
            });

            expect(mainInvocationInOutputPosition).toMatchObject({
                line: 20,
                column: 13,
            });
        });
    });
});
