import { compile } from "../compiler";
import { pretify, readFixture } from "./utils";

const HEALTHY_CONFIG = {
    outputConfig: {
        env: {},
        minify: false,
        compat: false,
        format: "amd"
    },
    name: "/x/foo/foo.js",
    namespace: "x",
    files: {
        "/x/foo/foo.js": readFixture(
            "class_and_template/class_and_template.js"
        ),
        "/x/foo/foo.html": readFixture(
            "class_and_template/class_and_template.html"
        )
    }
};

describe("compiler test", () => {
    test("should return success, references, diagnostics, code, mode", async () => {
        const output = await compile(HEALTHY_CONFIG);
        const { success, diagnostics, result } = output;
        const { code, references } = result;

        expect(code).toBeDefined();
        expect(diagnostics).toBeDefined();
        expect(references).toBeDefined();
        expect(success).toBeDefined();
    });

    test("should return reference object for valid source", async () => {
        const files = {
            files: {
                "/x/foo/foo.js": `import resource from '@resource-url/foo';`
            }
        };
        const config = { ...HEALTHY_CONFIG, ...files };

        const { result } = await compile(config);
        const { references } = result;
        expect(references).toBeDefined();
        expect(references[0]).toMatchObject({
            id: "foo",
            file: "/x/foo/foo.js",
            type: "resourceUrl",
            locations: [
                {
                    start: 36,
                    length: 3
                }
            ]
        });
    });
    test("compilation should not contain bundle properties if reference gathering encountered an error", async () => {
        const files = {
            files: { "test.js": `import * as MyClass from '@apex/MyClass';` }
        };
        const config = { ...HEALTHY_CONFIG, ...files };

        const { result, diagnostics, success } = await compile(config);
        expect(success).toBe(false);
        expect(diagnostics[0].level).toBe(0); // fatal
        expect(result).toBeUndefined();
    });
});
