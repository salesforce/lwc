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
const COMPILER_CONFIG_BASEDIR = {
    name: "foo",
    namespace: "x",
    files: { "project/src/foo.js": "debugger" },
    baseDir: "project/src",
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
        // transform should normalize options and append outputConfig
        const config = {
            name: "foo",
            namespace: "x",
            files: { "foo.js": "debugger" },
        };
        const { code } = await transform("debugger", "file.js", config);
        expect(code).toBe("debugger;");
    });

    test("able to retrieve version", () => {
        expect(version).toBeDefined();
    });

    test("specify basedir", async () => {
        const { result, success } = await compile(COMPILER_CONFIG_BASEDIR);
        expect(success).toBe(true);
        expect(result).toBeDefined();
    });

    test("don't specify basedir", async () => {
        expect.assertions(1);
        const config = {
            ...COMPILER_CONFIG_BASEDIR
        };
        delete config.baseDir;

        await expect(compile(config)).rejects.toMatchObject({
            message: "Could not resolve 'foo' (as foo.js) from compiler entry point"
        });
    });
});
