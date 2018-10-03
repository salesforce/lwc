import lwcMinifierFactory from '../minify';
import { RawSourceMap, SourceMapConsumer } from "source-map";

const codeFixture = `
    /*some comment*/
    var a = 1;
    console.log(a);
`;
const minifiedCode = "var a=1;console.log(a);";

describe('rollup plugin lwc-minify', () => {
    test('lwc-minify should not output sourcemaps', () => {
        // @ts-ignore
        const lwcMinifier = lwcMinifierFactory({ sourcemap: false });
        const result = lwcMinifier.transformBundle(codeFixture);

        expect(result.code).toBe(minifiedCode);
        expect(result.map).toBeNull();
    });
    test('should output a correct sourcemap', async () => {
        // @ts-ignore
        const lwcMinifier = lwcMinifierFactory({ sourcemap: true });
        const result = lwcMinifier.transformBundle(codeFixture);

        expect(result.map).not.toBeNull();

        // @ts-ignore
        await SourceMapConsumer.with(result!.map as RawSourceMap, null, sourceMapConsumer => {
            let gp;

            gp = sourceMapConsumer.generatedPositionFor({ line: 2, column: 0, source: "unknown" });
            // the comment...
            expect(gp.line).toBeNull();

            // var
            gp = sourceMapConsumer.originalPositionFor({ line: 1, column: 0 });
            expect(gp.line).toBe(3);
            expect(gp.column).toBe(4);

            // a
            gp = sourceMapConsumer.originalPositionFor({ line: 1, column: 4 });
            expect(gp.line).toBe(3);
            expect(gp.column).toBe(8);
            expect(gp.name).toBe('a');

            // the console
            gp = sourceMapConsumer.originalPositionFor({ line: 1, column: 8 });
            expect(gp.line).toBe(4);
            expect(gp.column).toBe(4);
            expect(gp.name).toBe('console');
        });
    });
});
