import { compile } from "../compiler";
import { pretify, readFixture } from "../../__tests__/utils";
import { DiagnosticLevel } from "../../diagnostics/diagnostic";

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
        "class_and_template.js": readFixture(
            "class_and_template/class_and_template.js"
        ),
        "class_and_template.html": readFixture(
            "class_and_template/class_and_template.html"
        )
    }
};

describe("compiler result", () => {
    test("compiler should return bundle result default output configuration ", async () => {
        const noOutputConfig = { ...VALID_CONFIG, outputConfig: undefined };
        const { result: { outputConfig } } = await compile(noOutputConfig);
        expect(outputConfig).toMatchObject({
            env: {
                NODE_ENV: "development"
            },
            minify: false,
            compat: false
        });
    });
    test("compiler should return bundle result with normalized DEV output config", async () => {
        const config = Object.assign({}, VALID_CONFIG, {
            outputConfig: {
                minify: false,
                compat: false
            }
        });
        const { result: { outputConfig } } = await compile(config);
        expect(outputConfig).toMatchObject({
            env: {
                NODE_ENV: "development"
            },
            minify: false,
            compat: false
        });
    });
    test("compiler should return bundle result with normalized PROD output config", async () => {
        const config = Object.assign({}, VALID_CONFIG, {
            outputConfig: {
                minify: true,
                compat: false,
                env: {
                    NODE_ENV: "production"
                }
            }
        });
        const { result: { outputConfig } } = await compile(config);
        expect(outputConfig).toMatchObject({
            env: {
                NODE_ENV: "production"
            },
            minify: true,
            compat: false
        });
    });
    test("compiler should return bundle result with normalized COMPAT output config", async () => {
        const config = Object.assign({}, VALID_CONFIG, {
            outputConfig: {
                minify: false,
                compat: true
            }
        });
        const { result: { outputConfig } } = await compile(config);
        expect(outputConfig).toMatchObject({
            env: {
                NODE_ENV: "development"
            },
            minify: false,
            compat: true
        });
    });
    test("compiler should return bundle result with normalized PROD_COMPAT output config", async () => {
        const config = Object.assign({}, VALID_CONFIG, {
            outputConfig: {
                minify: false,
                compat: true,
                env: {
                    NODE_ENV: "production"
                }
            }
        });
        const { result: { outputConfig } } = await compile(config);
        expect(outputConfig).toMatchObject({
            env: {
                NODE_ENV: "production"
            },
            minify: false,
            compat: true
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

    test("should compile sources nested inside component subfolders", async () => {
        const { result, success } = await compile({
            name: "foo",
            namespace: "x",
            files: {
                "foo.js": `import { Element } from 'engine';
                import { main } from './utils/util.js';
                export default class Test extends Element {
                    get myimport() {
                        return main();
                    }
                }
                `,
                "foo.html": readFixture("metadata/metadata.html"),
                "utils/util.js": `export function main() { return 'here is your import'; }`,
            },
        });
        expect(success).toBe(true);
    });

    test('compiler returns diagnostic errors when module resolution encounters an error', async () => {
        const config = {
            name: "foo",
            namespace: "x",
            files: {
                "foo.js": `import something from './nothing';`,
            },
        };
        const { success, diagnostics }  = await compile(config);
        expect(success).toBe(false);
        expect(diagnostics.length).toBe(1);

        const { level, message } = diagnostics[0];

        expect(level).toBe(DiagnosticLevel.Fatal);
        expect(message).toContain('Could not resolve \'./nothing\' (as nothing.js) from \'foo.js\'');
    });

    test('compiler returns diagnostic errors when transformation encounters an error in javascript', async () => {
        const config = {
            name: "foo",
            namespace: "x",
            files: {
                "foo.js": `throw`,
            },
        };
        const { success, diagnostics }  = await compile(config);

        expect(success).toBe(false);
        expect(diagnostics.length).toBe(1);

        const { level, message } = diagnostics[0];

        expect(level).toBe(DiagnosticLevel.Fatal);
        expect(message).toContain('Unexpected token (1:5)');
    });

    test('compiler returns diagnostic errors when transformation encounters an error in css', async () => {
        const config = {
            name: "foo",
            namespace: "x",
            files: {
                "foo.js": `import { Element } from 'engine';
                export default class Test extends Element {}
                `,
                "foo.html": `<template></template>`,
                "foo.css": `a {`,
            },
        };
        const { success, diagnostics }  = await compile(config);
        expect(success).toBe(false);
        expect(diagnostics.length).toBe(2);

        // check warning
        expect(diagnostics[0].level).toBe(DiagnosticLevel.Warning);
        expect(diagnostics[0].message).toBe('\'engine\' is imported by foo.js, but could not be resolved – treating it as an external dependency');

        // check error
        expect(diagnostics[1].level).toBe(DiagnosticLevel.Fatal);
        expect(diagnostics[1].message).toContain('Unclosed block');
    });

    test('compiler returns diagnostic errors when transformation encounters an error in html', async () => {
        const config = {
            name: "foo",
            namespace: "x",
            files: {
                "foo.js": `import { Element } from 'engine';
                export default class Test extends Element {}
                `,
                "foo.html": `<template>`,
            },
        };
        const { success, diagnostics }  = await compile(config);
        expect(success).toBe(false);
        expect(diagnostics.length).toBe(2);

        // check warning
        expect(diagnostics[0].level).toBe(DiagnosticLevel.Warning);
        expect(diagnostics[0].message).toBe('\'engine\' is imported by foo.js, but could not be resolved – treating it as an external dependency');

        // check error
        expect(diagnostics[1].level).toBe(DiagnosticLevel.Fatal);
        expect(diagnostics[1].message).toContain('foo.html: <template> has no matching closing tag.');
    });
});

describe("comiler metadata", () => {
    it("decorators and import locations", async () => {
        const { result: { code, metadata } } = await compile({
            name: "foo",
            namespace: "x",
            files: {
                "foo.js": readFixture("metadata/metadata.js"),
                "foo.html": readFixture("metadata/metadata.html")
            },
            outputConfig: { format: "es" }
        });

        expect(pretify(code)).toBe(
            pretify(readFixture("expected-sources-metadata.js"))
        );

        expect(metadata).toEqual({
            decorators: [
                {
                    type: "api",
                    targets: [
                        { type: "property", name: "publicProp" },
                        { type: "method", name: "publicMethod" }
                    ]
                },
                {
                    type: "wire",
                    targets: [
                        {
                            type: "property",
                            adapter: { name: "getTodo", reference: "todo" },
                            name: "wiredProp",
                            params: {},
                            static: {}
                        },
                        {
                            type: "method",
                            adapter: {
                                name: "getHello",
                                reference: "@schema/foo.bar"
                            },
                            name: "wiredMethod",
                            params: { name: "publicProp" },
                            static: { fields: ["one", "two"] }
                        }
                    ]
                }
            ],
            importLocations: []
        });
    });
});
