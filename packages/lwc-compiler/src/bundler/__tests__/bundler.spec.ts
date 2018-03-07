import { bundle } from "../bundler";
import { pretify } from "../../__tests__/utils";

describe('bundler', () => {
    test('throws when invoked without configurations', async () => {
        try {
            const { diagnostics, code, metadata } = await bundle();
        } catch (error) {
            expect(error.message).toBe("Expected options object, received \"undefined\".");
        }
    });

    test('produces bundle result for valid configuration', async () => {
        const config = {
            outputConfig: {
                env: { NODE_ENV: 'development'},
                minify: false,
                compat: false,
            },
            name: "foo",
            namespace: "x",
            files: {'foo.js': `debugger`},
        }
        const { diagnostics, code, metadata } = await bundle(config);

        expect(pretify(code)).toBe(
            pretify(`define('x-foo', function () {
                debugger;
            });`)
        );
        expect(diagnostics).toBeDefined();
        expect(metadata).toBeDefined();
    });
});
