/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { SourceMapConsumer } from 'source-map';
import lwcMinifierFactory from '../minify';

const codeFixture = `
    /*some comment*/
    var a = 1;
    console.log(a);
`;
const minifiedCode = 'var a=1;console.log(a);';

describe('rollup plugin lwc-minify', () => {
    test('lwc-minify should not output sourcemaps', () => {
        const lwcMinifier = lwcMinifierFactory({ sourcemap: false });
        const result = lwcMinifier.renderChunk(codeFixture);

        expect(result).toBe(minifiedCode);
    });
    test('should output a correct sourcemap', async () => {
        const lwcMinifier = lwcMinifierFactory({ sourcemap: true });
        const result = lwcMinifier.renderChunk(codeFixture);

        expect(result.map).not.toBeNull();

        await SourceMapConsumer.with(result!.map, null, (sourceMapConsumer) => {
            const commentInOutputPosition = sourceMapConsumer.generatedPositionFor({
                line: 2,
                column: 0,
                source: 'unknown',
            });
            expect(commentInOutputPosition.line).toBeNull();

            const varPosition = sourceMapConsumer.originalPositionFor({ line: 1, column: 0 });
            expect(varPosition.line).toBe(3);
            expect(varPosition.column).toBe(4);

            const variableNamePosition = sourceMapConsumer.originalPositionFor({
                line: 1,
                column: 4,
            });
            expect(variableNamePosition.line).toBe(3);
            expect(variableNamePosition.column).toBe(8);
            expect(variableNamePosition.name).toBe('a');

            // the console
            const consolePosition = sourceMapConsumer.originalPositionFor({ line: 1, column: 8 });
            expect(consolePosition.line).toBe(4);
            expect(consolePosition.column).toBe(4);
            expect(consolePosition.name).toBe('console');
        });
    });
});
