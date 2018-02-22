import { readFile } from "fs";

/* eslint-env node, jest */

const { compile } = require("../index");
const { fixturePath, readFixture, pretify } = require("./utils");


const CLASS_AND_TEMPLATE_CONFIG = {
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

const NODE_ENV_CONFIG = {
    name: 'node_env',
    namespace: 'x',
    files: {
        'node_env.js': readFixture("node_env/node_env.js"),
        'node_env.html': readFixture("node_env/node_env.html"),
    },
    outputConfig: { format: 'es' }
};

describe("validate options", () => {
    it("should validate entry type", async () => {
        expect.assertions(1);
        try {
            await compile({});
        } catch (error) {
            expect(error.message).toBe(
                "Expected a string for entry. Received instead undefined"
            );
        }
    });

    it("should validate sources option format", async () => {
        expect.assertions(1);
        try {
            const result = await compile({
                name: "foo",
                namespace: "x",

                files: {
                    "/x/foo/foo.js": true
                }
            });
        } catch (error) {
            expect(error.message).toBe(
                "in-memory module resolution expects values to be string. Received true for key /x/foo/foo.js"
            );
        }
    });
});

describe("stylesheet", () => {
    it("should import the associated stylesheet by default", async () => {
        const { result: { code } } = await compile({
            name: 'styled',
            namespace: 'x',
            files: {
                "styled.js": readFixture("namespaced_folder/styled/styled.js"),
                "styled.html": readFixture("namespaced_folder/styled/styled.html"),
                "styled.css": readFixture("namespaced_folder/styled/styled.css")
            },
            outputConfig: { format: 'es' },
        });
        expect(pretify(code)).toBe(pretify(readFixture("expected-styled.js")));
    });

    it("should import compress css in prod mode", async () => {
        const { result: { code } } = await compile({
            name: 'styled',
            namespace: 'x',
            files: {
                "styled.js": readFixture("namespaced_folder/styled/styled.js"),
                "styled.html": readFixture("namespaced_folder/styled/styled.html"),
                "styled.css": readFixture("namespaced_folder/styled/styled.css")
            },
            outputConfig: { format: 'es', minify: true },
        });
        expect(pretify(code)).toBe(pretify(readFixture("expected-styled-prod.js")));
    });
});

// TODO: all 3 cases: validation used to have x-class_and_template instead of class_and_template;
// is this correct since we removed normalized module name, or is our namespace not working properly?
describe("mode generation", () => {
    it("handles prod mode", async () => {
        const config = {...CLASS_AND_TEMPLATE_CONFIG, ...{ outputConfig: {minify: true}}};
        const { result: { code, metadata }} = await compile(config);

        expect(pretify(code)).toBe(
            pretify(readFixture("expected-prod-mode.js"))
        );

        expect(metadata).toEqual({
            decorators: [],
            references: [{ name: "engine", type: "module" }]
        });
    });

    it("handles compat mode", async () => {
        const config = {...CLASS_AND_TEMPLATE_CONFIG, ...{ outputConfig: { compat: true }}};
        const { result: { code, metadata }} = await compile(config);

        expect(pretify(code)).toBe(
            pretify(readFixture("expected-compat-mode.js"))
        );

        expect(metadata).toMatchObject({
            decorators: [],
            references: [{ name: "engine", type: "module" }]
        });
    });

    it("handles prod-compat mode", async () => {
        const config = {...CLASS_AND_TEMPLATE_CONFIG, ...{ outputConfig: { compat: true, minify: true }}};
        const { result: { code, metadata }} = await compile(config);

        expect(pretify(code)).toBe(
            pretify(readFixture("expected-prod_compat-mode.js"))
        );

        expect(metadata).toEqual({
            decorators: [],
            references: [{ name: "engine", type: "module" }]
        });
    });
});

describe("node env", function() {
    it("does not remove production code when no NODE_ENV option is specified", async () => {
        const previous = process.env.NODE_ENV;
        process.env.NODE_ENV = undefined;
        const { result: { code }} = await compile(NODE_ENV_CONFIG);
        process.env.NODE_ENV = previous;

        expect(pretify(code)).toBe(
            pretify(readFixture("expected-node-env-dev.js"))
        );
    });

    it("does removes production code when process.env.NODE_ENV is production", async () => {
        const previous = process.env.NODE_ENV;
        process.env.NODE_ENV = "production";
        const { result: { code, metadata }} = await compile(NODE_ENV_CONFIG);
        process.env.NODE_ENV = previous;

        expect(pretify(code)).toBe(
            pretify(readFixture("expected-node-env-prod.js"))
        );
    });

    it("removes production code when NODE_ENV option is production", async () => {
        const config = {...NODE_ENV_CONFIG, ...{ outputConfig: { format: 'es', env: { NODE_ENV: 'production'}}}};
        const { result: { code, metadata }} = await compile(config);

        expect(pretify(code)).toBe(
            pretify(readFixture("expected-node-env-prod.js"))
        );
    });

    it("does not remove production code when in NODE_ENV option is development", async () => {
        const config = {...NODE_ENV_CONFIG, ...{ outputConfig: { format: 'es', env: { NODE_ENV: 'development'}}}};
        const { result: { code, metadata }} = await compile(config);

        expect(pretify(code)).toBe(
            pretify(readFixture("expected-node-env-dev.js"))
        );
    });
});

describe("metadata output", () => {
    it("decorators and references", async () => {
        const { result: { code, metadata }} = await compile({
            name: 'foo',
            namespace: 'x',
            files: {
                "foo.js": readFixture("metadata/metadata.js"),
                "foo.html": readFixture("metadata/metadata.html")
            },
            outputConfig: { format: 'es' },
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
            references: [
                { name: "x-bar", type: "component" },
                { name: "engine", type: "module" },
                { name: "todo", type: "module" },
                { name: "@schema/foo.bar", type: "module" }
            ]
        });
    });
});
