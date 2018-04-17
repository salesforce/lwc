import { compile } from "../compiler";
import { pretify, readFixture } from "./utils";

const VALID_CONFIG = {
    outputConfig: {
        env: {},
        minify: false,
        compat: false,
        format: "amd"
    },
    name: "foo",
    namespace: "x",
    files: {
        "foo.js": readFixture("class_and_template/class_and_template.js"),
        "foo.html": readFixture("class_and_template/class_and_template.html")
    }
};

describe("compiler options", () => {
    it("should validate presence of options", async () => {
        expect.assertions(1);
        try {
            await compile();
        } catch (error) {
            expect(error.message).toBe(
                'Expected options object, received "undefined".'
            );
        }
    });

    it("should validate bundle name option", async () => {
        expect.assertions(1);
        try {
            await compile({});
        } catch (error) {
            expect(error.message).toBe(
                'Expected a string for name, received "undefined".'
            );
        }
    });

    it("should validate bundle namespace option", async () => {
        expect.assertions(1);
        try {
            await compile({ name: "foo" });
        } catch (error) {
            expect(error.message).toBe(
                'Expected a string for namespace, received "undefined".'
            );
        }
    });

    it("should validate presence of files option", async () => {
        expect.assertions(1);
        try {
            await compile({
                name: "/x/foo/foo.js",
                namespace: "x",
                files: {}
            });
        } catch (error) {
            expect(error.message).toBe(
                "Expected an object with files to be compiled."
            );
        }
    });

    it("should validate files option value type", async () => {
        expect.assertions(1);
        try {
            const result = await compile({
                name: "foo",
                namespace: "x",

                files: {
                    "foo.js": true
                }
            });
        } catch (error) {
            expect(error.message).toBe(
                'Unexpected file content for "foo.js". Expected a string, received "true".'
            );
        }
    });

    it("should validate outputConfig.minify", async () => {
        expect.assertions(1);
        try {
            await compile({
                name: "foo",
                namespace: "x",
                files: { x: "foo" },
                outputConfig: {
                    minify: "true"
                }
            });
        } catch (error) {
            expect(error.message).toBe(
                'Expected a boolean for outputConfig.minify, received "true".'
            );
        }
    });

    it("should validate outputConfig.compat", async () => {
        expect.assertions(1);
        try {
            await compile({
                name: "foo",
                namespace: "x",
                files: { x: "foo" },
                outputConfig: {
                    compat: "true"
                }
            });
        } catch (error) {
            expect(error.message).toBe(
                'Expected a boolean for outputConfig.compat, received "true".'
            );
        }
    });
});

describe("compiler output", () => {
    test("compiler should return bundle result default output configuration ", async () => {
        const noOutpuConfig = Object.assign({}, VALID_CONFIG);
        delete noOutpuConfig.outputConfig;
        const { result: { outputConfig } } = await compile(noOutpuConfig);
        expect(outputConfig).toMatchObject({
            outputConfig: {
                env: {
                    NODE_ENV: 'development',
                },
                minify: false,
                compat: false,
            },
        });
    });
    test("compiler should return bundle result with normalized DEV output config", async () => {
        const config = Object.assign({}, VALID_CONFIG, {
            outputConfig: {
                minify: false,
                compat: false,
            },
        });
        const { result: { outputConfig } } = await compile(config);
        expect(outputConfig).toMatchObject({
            outputConfig: {
                env: {
                    NODE_ENV: 'development',
                },
                minify: false,
                compat: false,
            },
        });
    });
    test("compiler should return bundle result with normalized PROD output config", async () => {
        const config = Object.assign({}, VALID_CONFIG, {
            outputConfig: {
                minify: true,
                compat: false,
                env: {
                    NODE_ENV: 'production',
                }
            },
        });
        const { result: { outputConfig } } = await compile(config);
        expect(outputConfig).toMatchObject({
            outputConfig: {
                env: {
                    NODE_ENV: 'production',
                },
                minify: true,
                compat: false,
            },
        });
    });
    test("compiler should return bundle result with normalized COMPAT output config", async () => {
        const config = Object.assign({}, VALID_CONFIG, {
            outputConfig: {
                minify: false,
                compat: true,
            },
        });
        const { result: { outputConfig } } = await compile(config);
        expect(outputConfig).toMatchObject({
            outputConfig: {
                env: {
                    NODE_ENV: 'development',
                },
                minify: false,
                compat: true,
            },
        });
    });
    test("compiler should return bundle result with normalized PROD_COMPAT output config", async () => {
        const config = Object.assign({}, VALID_CONFIG, {
            outputConfig: {
                minify: false,
                compat: true,
                env: {
                    NODE_ENV: 'production',
                }
            },
        });
        const { result: { outputConfig } } = await compile(config);
        expect(outputConfig).toMatchObject({
            outputConfig: {
                env: {
                    NODE_ENV: 'production',
                },
                minify: false,
                compat: true,
            },
        });
    });
    test("should return output object with expected properties", async () => {
        const output = await compile(VALID_CONFIG);
        const { success, diagnostics, result, version } = output;
        const { code, metadata } = result;

        expect(code).toBeDefined();
        expect(diagnostics).toBeDefined();
        expect(version).toBeDefined();
        expect(metadata).toBeDefined();
        expect(success).toBeDefined();
    });
});
