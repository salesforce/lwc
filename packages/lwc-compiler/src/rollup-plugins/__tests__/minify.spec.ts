import lwcMinifierFactory from '../minify';

const codeFixture = "/*some comment*/var a = 1;\nconsole.log(a);";
const minifiedCode = "var a=1;console.log(a);";

describe('rollup plugin lwc-minify', () => {
    test('lwc-minify default', () => {
        const lwcMinifier = lwcMinifierFactory();
        const result = lwcMinifier.transformBundle(codeFixture);

        expect(result.code).toBe(minifiedCode);
        expect(result.map).not.toBeNull();
    });
    test('should override with options', () => {
        const lwcMinifier = lwcMinifierFactory({ sourcemap: false });
        const result = lwcMinifier.transformBundle(codeFixture);

        expect(result.map).toBeNull();
    });
});
