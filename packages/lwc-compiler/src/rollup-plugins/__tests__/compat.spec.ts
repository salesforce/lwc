import lwcCompatFactory from '../compat';
import { NormalizedOutputConfig } from "../../compiler/options";
import { RawSourceMap, SourceMapConsumer } from "source-map";

const codeFixture = `
const a = 1;
console.log(a);
`;
const compatCode = `import __callKey1 from "proxy-compat/callKey1";
var a = 1;

__callKey1(console, "log", a);`;

describe('rollup plugin lwc-compat', () => {
    test('output without sourcemap', () => {
        const lwcCompat = lwcCompatFactory({ sourcemap: false } as NormalizedOutputConfig);
        const result = lwcCompat.transform(codeFixture);

        expect(result.code).toBe(compatCode);
        expect(result.map).toBeNull();
    });
    test('outputs a correct sourcemap', async () => {
        const lwcCompat = lwcCompatFactory({ sourcemap: true } as NormalizedOutputConfig);
        const result = lwcCompat.transform(codeFixture);

        expect(result.map).not.toBeNull();

        // @ts-ignore
        await SourceMapConsumer.with(result!.map as RawSourceMap, null, sourceMapConsumer => {

            let gp;

            // @ts-ignore
            gp = sourceMapConsumer.allGeneratedPositionsFor({ line: 2, source: "unknown" });

            // const -> var;
            expect(gp[0].line).toBe(2);
            expect(gp[0].column).toBe(0);
            expect(gp[0].lastColumn).toBe(3);

            // a -> a; *Note: gp[1] is the semicolon mapping.
            expect(gp[2].line).toBe(2);
            expect(gp[2].column).toBe(4);
            expect(gp[2].lastColumn).toBe(4);

            // mappings for the console.log
            // @ts-ignore
            gp = sourceMapConsumer.allGeneratedPositionsFor({ line: 3, source: "unknown" });

            // console -> __callKey1(console
            expect(gp[0].line).toBe(4);
            expect(gp[0].column).toBe(0);
            expect(gp[0].lastColumn).toBe(10);

        });
    });
});
