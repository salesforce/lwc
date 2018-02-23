import { compile, transform, version } from "../index";

const COMPILER_CONFIG = {
    name: "foo",
    namespace: "x",
    files: { "foo.js": "debugger" },
    outputConfig: {
        env: { NODE_ENV: "development" },
        minify: false,
        compat: false
    }
};

describe("test index entry points", () => {
    test("able to invoke compiler", async () => {
        const { result, success } = await compile(COMPILER_CONFIG);
        expect(success).toBe(true);
        expect(result).toBeDefined();
    });

    test("able to invoke transformer", async () => {
        const { code } = await transform("debugger", "file.js", COMPILER_CONFIG);
        expect(code).toBe("debugger;");
    });

    test("able to retrieve version", () => {
        expect(version).toBeDefined();
    });
});
