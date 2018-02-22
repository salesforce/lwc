const { compile } = require("../index");
const { fixturePath, readFixture, pretify } = require("./utils");

describe("regression test", () => {
    it("#743 - Object rest spread throwing", async () => {
        const actual = `const base = { foo: true }; const res = { ...base, bar: false };`;
        const expected = `define('/x/foo/foo.js', function () {
            const base = { foo: true };const res = Object.assign({}, base, { bar: false });
            });`;

        const { result } = await compile({
            name: "/x/foo/foo.js",
            namespace: "x",
            files: {
                "/x/foo/foo.js": actual
            }
        });

        expect(pretify(result.code)).toBe(pretify(expected));
    });
});

describe("smoke test for babel transform", () => {
    it("should transpile none stage-4 syntax features in none-compat", async () => {
        const { result } = await compile({
                name: 'babel',
                namespace: 'x',
                files: {
                    'babel.js': readFixture("namespaced_folder/babel/babel.js")
                },
                outputConfig: { format: 'es' }
            }
        );

        expect(pretify(result.code)).toBe(pretify(readFixture("expected-babel.js")));
    });

    it("should transpile back to es5 in compat mode", async () => {
        const { result } = await compile({
            name: 'babel',
            namespace: 'x',
            files: {
                'babel.js': readFixture("namespaced_folder/babel/babel.js")
            },
            outputConfig: {
                compat: true,
                format: 'es',
            }
        });

        expect(pretify(result.code)).toBe(
            pretify(readFixture("expected-babel-compat.js"))
        );
    });
});
