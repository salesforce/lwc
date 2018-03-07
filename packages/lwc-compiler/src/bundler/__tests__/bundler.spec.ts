const { bundle } = require("../bundler");
const { pretify } = require("../../__tests__/utils");

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

    test("import location is returned for valid bundle", async () => {
        const src = `
            import xBar from 'x-bar';
            import xFoo from 'x-foo';
            import xZoo from 'x-zoo';
            xBoo();
            xFoo();
            xZoo();
        `;

        const config = {
            outputConfig: {
                env: { NODE_ENV: "development" },
                minify: false,
                compat: false
            },
            name: "foo",
            namespace: "x",
            files: { "foo.js": src }
        };

        const { importLocations } = await bundle(config);
        expect(importLocations.length).toBe(3);
        expect(importLocations[0].name).toBe("x-bar");
        expect(importLocations[0].location).toMatchObject({
            start: 18,
            length: 5
        });
    });
});
