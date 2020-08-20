import path from 'path';
import { rollup } from 'rollup';

import lwc from '../../index';

describe('resolver', () => {
    it('should be capable to resolve all the base LWC module imports', async () => {
        const warnings = [];

        await rollup({
            input: path.resolve(__dirname, 'fixtures/lwc-modules/lwc-modules.js'),
            plugins: [lwc()],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        expect(warnings).toHaveLength(0);
    });

    it('should use lwc.config.json to resolve LWC modules', async () => {
        const bundle = await rollup({
            input: path.resolve(__dirname, 'fixtures/lwc-config-json/src/index.js'),
            plugins: [lwc()],
        });

        const result = await bundle.generate({
            format: 'esm',
        });

        const { code } = result.output[0];
        expect(code).toContain('"button:v1');
        expect(code).toContain('"button:v2');
    });

    it('should properly resolve LWC module with implicit template', async () => {
        const warnings = [];

        await rollup({
            input: path.resolve(__dirname, 'fixtures/implicit-html/implicit-html.js'),
            plugins: [lwc()],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        expect(warnings).toHaveLength(0);
    });

    it('should properly resolve LWC module with implicit stylesheet', async () => {
        const warnings = [];

        await rollup({
            input: path.resolve(__dirname, 'fixtures/implicit-css/implicit-css.js'),
            plugins: [lwc()],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        expect(warnings).toHaveLength(0);
    });

    it("should ignore module that can't be resolved by LWC module resolver", async () => {
        const warnings = [];

        await rollup({
            input: path.resolve(__dirname, 'fixtures/unknown-module/unknown-module.js'),
            plugins: [lwc()],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toMatchObject({
            code: 'UNRESOLVED_IMPORT',
            source: 'some/module',
        });
    });
});
