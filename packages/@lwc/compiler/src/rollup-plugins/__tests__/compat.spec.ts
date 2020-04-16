/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { SourceMapConsumer } from 'source-map';
import lwcCompatFactory from '../compat';

const codeFixture = `
const a = 1;
console.log(a);
`;
const compatCode = `import __callKey1 from "proxy-compat/callKey1";
var a = 1;

__callKey1(console, "log", a);`;

describe('rollup plugin lwc-compat', () => {
    test('output without sourcemap', () => {
        const lwcCompat = lwcCompatFactory({ sourcemap: false });
        const result = lwcCompat.transform(codeFixture);

        expect(result.code).toBe(compatCode);
        expect(result.map).toBeNull();
    });
    test('outputs a correct sourcemap', async () => {
        const lwcCompat = lwcCompatFactory({ sourcemap: true });
        const result = lwcCompat.transform(codeFixture);

        expect(result.map).not.toBeNull();

        await SourceMapConsumer.with(result!.map, null, (sourceMapConsumer) => {
            const varMappedToConstPosition = sourceMapConsumer.originalPositionFor({
                line: 2,
                column: 0,
            });

            expect(varMappedToConstPosition.line).toBe(2);
            expect(varMappedToConstPosition.column).toBe(0);

            const aDeclarationPosition = sourceMapConsumer.originalPositionFor({
                line: 2,
                column: 4,
            });

            expect(aDeclarationPosition.line).toBe(2);
            expect(aDeclarationPosition.column).toBe(6);
            expect(aDeclarationPosition.name).toBe('a');

            const setKeyMappedToConsolePosition = sourceMapConsumer.originalPositionFor({
                line: 4,
                column: 0,
            });
            expect(setKeyMappedToConsolePosition.line).toBe(3);
            expect(setKeyMappedToConsolePosition.column).toBe(0);
        });
    });
});
