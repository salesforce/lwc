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
    test("should return output object with expected properties", async () => {
        const output = await compile(VALID_CONFIG);
        const { success, diagnostics, result } = output;
        const { code, references, metadata } = result;

        expect(code).toBeDefined();
        expect(diagnostics).toBeDefined();
        expect(references).toBeDefined();
        expect(metadata).toBeDefined();
        expect(success).toBeDefined();
    });

    test("output should contain reference object", async () => {
        const files = {
            files: {
                "foo.js": `import resource from '@resource-url/foo';`
            }
        };
        const config = { ...VALID_CONFIG, ...files };

        const { result } = await compile(config);
        const { references } = result;
        expect(references).toMatchObject([
            {
                id: "foo",
                file: "foo.js",
                type: "resourceUrl",
                locations: [
                    {
                        start: 36,
                        length: 3
                    }
                ]
            }
        ]);
    });
    test("should return references for multiple files", async () => {
        const config = {
            namespace: "x",
            name: "foo",
            type: "platform",
            files: {
                "foo.js": `
                import { Element, api, track, wire } from 'engine';

                export default class Foo extends Element {
                    @api greeting = 'bob';
                    @track state = {};
                    @wire('ldsRecord', { name: '$greeting', params: {} }) record;
                }
            `,
                "foo.html": `
                <template>
                    <h1>{greeting}</h1>
                    <x-bar></x-bar>
                </template>
            `
            }
        };
        const { result: { references } } = await compile(config);
        const expectedReferences = [
            {
                file: "foo.js",
                id: "engine",
                locations: [{ length: 6, start: 74 }],
                type: "module"
            },
            {
                file: "foo.html",
                id: "x-bar",
                locations: [{ length: 5, start: 89 }, { length: 5, start: 97 }],
                type: "component"
            }
        ];
        expect(references).toMatchObject(expectedReferences);
    });
    test("compilation should not contain bundle result if reference gathering encountered an error", async () => {
        const files = {
            files: { "test.js": `import * as MyClass from '@apex/MyClass';` }
        };
        const config = { ...VALID_CONFIG, ...files };

        const { result, diagnostics, success } = await compile(config);
        expect(result).toBeUndefined();
        expect(success).toBe(false);
        expect(diagnostics[0].level).toBe(0); // fatal
    });
});
