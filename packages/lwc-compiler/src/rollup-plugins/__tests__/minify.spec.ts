import lwcMinifierFactory from '../minify';

const codeFixture = `
    /*some comment*/
    var a = 1;
    console.log(a);
`;
const minifiedCode = "var a=1;console.log(a);";

describe('rollup plugin lwc-minify', () => {
    test('lwc-minify should not output sourcemaps', () => {
        const lwcMinifier = lwcMinifierFactory({
            compat: false,
            minify: true,
            sourcemap: false,
            env: {
                dev: 'dev'
            }
        });
        const result = lwcMinifier.transformBundle(codeFixture);

        expect(result.code).toBe(minifiedCode);
        expect(result.map).toBeNull();
    });
    test('should output sourcemaps', () => {
        // tslint:disable-line
        const lwcMinifier = lwcMinifierFactory({
            compat: false,
            minify: true,
            sourcemap: true,
            env: {
                dev: 'dev'
            }
        });
        const result = lwcMinifier.transformBundle(codeFixture);

        expect(result.map).not.toBeNull();
    });
});
