import { compile } from "../compiler";
import { pretify, readFixture } from "../../__tests__/utils";

const VALID_CONFIG = {
    outputConfig: {
        env: {},
        minify: false,
        compat: false,
        format: "amd"
    },
    name: "class_and_template",
    namespace: "x",
    files: {
        "class_and_template.js": readFixture("class_and_template/class_and_template.js"),
        "class_and_template.html": readFixture("class_and_template/class_and_template.html")
    }
};

describe("compiler options", () => {
    it("should validate presence of options", async () => {
        expect.assertions(1);
        await expect(compile()).rejects.toMatchObject({
            message: 'Expected options object, received "undefined".'
        });
    });

    it("should validate bundle name option", async () => {
        expect.assertions(1);
        await expect(compile({})).rejects.toMatchObject({
            message: 'Expected a string for name, received "undefined".'
        });
    });

    it("should validate bundle namespace option", async () => {
        expect.assertions(1);
        await expect(compile({ name: "foo" })).rejects.toMatchObject({
            message: 'Expected a string for namespace, received "undefined".'
        });
    });

    it("should validate presence of files option", async () => {
        expect.assertions(1);
        await expect(
            compile({
                name: "/x/foo/foo.js",
                namespace: "x",
                files: {}
            })
        ).rejects.toMatchObject({
            message: "Expected an object with files to be compiled."
        });
    });

    it("should validate files option value type", async () => {
        expect.assertions(1);
        await expect(
            compile({
                name: "foo",
                namespace: "x",
                files: {
                    "foo.js": true
                }
            })
        ).rejects.toMatchObject({
            message:
                'Unexpected file content for "foo.js". Expected a string, received "true".'
        });
    });

    it("should validate outputConfig.minify", async () => {
        expect.assertions(1);
        await expect(
            compile({
                name: "foo",
                namespace: "x",
                files: { x: "foo" },
                outputConfig: {
                    minify: 'true'
                }
            })
        ).rejects.toMatchObject({
            message:
                'Expected a boolean for outputConfig.minify, received "true".'
        });
    });

    it("should validate outputConfig.compat", async () => {
        expect.assertions(1);
        await expect(
            compile({
                name: "foo",
                namespace: "x",
                files: { x: "foo" },
                outputConfig: {
                    compat: 'true'
                }
            })
        ).rejects.toMatchObject({
            message:
                'Expected a boolean for outputConfig.compat, received "true".'
        });
    });
});
