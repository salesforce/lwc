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
                "foo.js": `import { LightningElement } from 'lwc';
                import { main } from './utils/util.js';
                export default class Test extends LightningElement {
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
        expect(message).toContain('./nothing failed to be resolved from foo.js');
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
                "foo.js": `import { LightningElement } from 'lwc';
                export default class Test extends LightningElement {}
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
        expect(diagnostics[0].message).toBe('\'lwc\' is imported by foo.js, but could not be resolved – treating it as an external dependency');

        // check error
        expect(diagnostics[1].level).toBe(DiagnosticLevel.Fatal);
        expect(diagnostics[1].message).toContain('Unclosed block');
    });

    test('compiler returns diagnostic errors when transformation encounters an error in html', async () => {
        const config = {
            name: "foo",
            namespace: "x",
            files: {
                "foo.js": `import { LightningElement } from 'lwc';
                export default class Test extends LightningElement {}
                `,
                "foo.html": `<template>`,
            },
        };
        const { success, diagnostics }  = await compile(config);
        expect(success).toBe(false);
        expect(diagnostics.length).toBe(2);

        // check warning
        expect(diagnostics[0].level).toBe(DiagnosticLevel.Warning);
        expect(diagnostics[0].message).toBe('\'lwc\' is imported by foo.js, but could not be resolved – treating it as an external dependency');

        // check error
        expect(diagnostics[1].level).toBe(DiagnosticLevel.Fatal);
        expect(diagnostics[1].message).toContain('foo.html: <template> has no matching closing tag.');
    });

    test('compiler should correctly point out missing "track" decorator import error', async () => {
        const config = {
            name: "foo",
            namespace: "x",
            files: {
                "foo.js": `import { api, LightningElement } from 'lwc';
                export default class Test extends LightningElement {
                    @track title = 'hello'
                }
                `,
            },
        };
        const { success, diagnostics }  = await compile(config);
        expect(diagnostics[0].message).toContain("Invalid decorator usage. It seems that you are not importing '@track' decorator from the 'lwc'");
    });

    test('compiler should correctly point out missing "wire" decorator import error', async () => {
        const config = {
            name: "foo",
            namespace: "x",
            files: {
                "foo.js": `import { LightningElement } from 'lwc';
                import { getTodo } from "todo";
                export default class Test extends LightningElement {
                    @wire(getTodo, {})
                    data = {};
                }
                `,
            },
        };
        const { success, diagnostics }  = await compile(config);
        expect(diagnostics[0].message).toContain("Invalid decorator usage. It seems that you are not importing '@wire' decorator from the 'lwc'");
    });

    test('compiler should correctly point out missing "api" decorator import error', async () => {
        const config = {
            name: "foo",
            namespace: "x",
            files: {
                "foo.js": `import { LightningElement } from 'lwc';
                export default class Test extends LightningElement {
                    @api boo = 'jel';
                }
                `,
            },
        };
        const { success, diagnostics }  = await compile(config);
        expect(diagnostics[0].message).toContain("Invalid decorator usage. It seems that you are not importing '@api' decorator from the 'lwc'");
    });
});

describe("compiler metadata", () => {
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
            importLocations: [],
            classMembers: [
                {
                    name: "publicProp",
                    type: "property",
                    decorator: "api",
                    loc: {
                        start: { column: 4, line: 6 },
                        end: { column: 15, line: 7 },
                    },
                },
                {
                    name: "publicMethod",
                    type: "method",
                    decorator: "api",
                    loc: {
                        start: { column: 4, line: 9 },
                        end: { column: 5, line: 12 },
                    },
                },
                {
                    name: "wiredProp",
                    type: "property",
                    decorator: "wire",
                    loc: {
                        start: { column: 4, line: 14 },
                        end: { column: 14, line: 15 },
                    },
                },
                {
                    name: "wiredMethod",
                    type: "method",
                    decorator: "wire",
                    loc: {
                        start: { column: 4, line: 17 },
                        end: { column: 5, line: 19 },
                    },
                }
            ],
            declarationLoc: {
                start: {column: 0, line: 5},
                end: {column: 1, line: 20},
            }
        });
    });

    it("doc", async () => {
        const { result: { code, metadata } } = await compile({
            name: "foo",
            namespace: "x",
            files: {
                "foo.js": `import { LightningElement, api } from 'lwc';
                /** class jsdoc */
                export default class Test extends LightningElement {
                    /** prop1 */
                    @api prop1;

                    /** prop2 */
                    @api get prop2() {
                    }

                    /** method1 */
                    @api method1() {}
                }
                `,
                "foo.html": "<template>foo</template>",
            },
        });

        expect(metadata).toEqual({
            decorators: [
                {
                    type: "api",
                    targets: [
                        { type: "property", name: "prop1" },
                        { type: "property", name: "prop2" },
                        { type: "method", name: "method1" }
                    ]
                }
            ],
            importLocations: [
                {
                    location: { length: 3, start: 18 },
                     name: "lwc"
                }
            ],
            classMembers: [
                {
                    name: "prop1",
                    type: "property",
                    decorator: "api",
                    doc: "* prop1",
                    loc: {
                        start: { column: 20, line: 5 },
                        end: { column: 31, line: 5 },
                    },
                },
                {
                    name: "prop2",
                    type: "property",
                    decorator: "api",
                    doc: "* prop2",
                    loc: {
                        start: { column: 20, line: 8 },
                        end: { column: 21, line: 9 },
                    },
                },
                {
                    name: "method1",
                    type: "method",
                    decorator: "api",
                    doc: "* method1",
                    loc: {
                        start: { column: 20, line: 12 },
                        end: { column: 37, line: 12 },
                    },
                },
            ],
            declarationLoc: {
                start: {column: 16, line: 3},
                end: {column: 17, line: 13},
            },
            doc: "* class jsdoc",
        });
    });
});
