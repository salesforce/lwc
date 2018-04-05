import { readFile } from "fs";
import { compile } from "../index";
import { fixturePath, readFixture, pretify } from "./utils";

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
    name: "node_env",
    namespace: "x",
    files: {
        "node_env.js": readFixture("node_env/node_env.js"),
        "node_env.html": readFixture("node_env/node_env.html")
    },
    outputConfig: { format: "es" }
};

describe("stylesheet", () => {
    it("should import the associated stylesheet by default", async () => {
        const { result: { code } } = await compile({
            name: "styled",
            namespace: "x",
            files: {
                "styled.js": readFixture("namespaced_folder/styled/styled.js"),
                "styled.html": readFixture(
                    "namespaced_folder/styled/styled.html"
                ),
                "styled.css": readFixture("namespaced_folder/styled/styled.css")
            },
            outputConfig: { format: "es" }
        });
        expect(pretify(code)).toBe(pretify(readFixture("expected-styled.js")));
    });

    it("should import compress css in prod mode", async () => {
        const { result: { code } } = await compile({
            name: "styled",
            namespace: "x",
            files: {
                "styled.js": readFixture("namespaced_folder/styled/styled.js"),
                "styled.html": readFixture(
                    "namespaced_folder/styled/styled.html"
                ),
                "styled.css": readFixture("namespaced_folder/styled/styled.css")
            },
            outputConfig: { format: "es", minify: true }
        });
        expect(pretify(code)).toBe(
            pretify(readFixture("expected-styled-prod.js"))
        );
    });
});

describe("compilation mode", () => {
    it("handles prod mode", async () => {
        const config = {
            ...CLASS_AND_TEMPLATE_CONFIG,
            ...{ outputConfig: { minify: true } }
        };
        const { result: { code, metadata } } = await compile(config);

        expect(pretify(code)).toBe(
            pretify(readFixture("expected-prod-mode.js"))
        );

        expect(metadata).toEqual({
            decorators: [],
            importLocations: [
                { location: { length: 8, start: 31 }, name: '"engine"' }
            ]
        });
    });

    it("handles compat mode", async () => {
        const config = {
            ...CLASS_AND_TEMPLATE_CONFIG,
            ...{ outputConfig: { compat: true } }
        };
        const { result: { code, metadata } } = await compile(config);
        expect(pretify(code)).toBe(
            pretify(readFixture("expected-compat-mode.js"))
        );

        const { decorators, importLocations } = metadata;
        expect(decorators.length).toBe(0);
        expect(importLocations.length).toBe(8);
    });

    it("handles prod-compat mode", async () => {
        const config = {
            ...CLASS_AND_TEMPLATE_CONFIG,
            ...{ outputConfig: { compat: true, minify: true } }
        };
        const { result: { code, metadata } } = await compile(config);

        expect(pretify(code)).toBe(
            pretify(readFixture("expected-prod_compat-mode.js"))
        );

        const { decorators, importLocations } = metadata;
        expect(decorators.length).toBe(0);
        expect(importLocations.length).toBe(8);
    });
});

describe("node env", function() {
    it('sets env.NODE_ENV to "development" by default', async () => {
        const config = {
            name: "foo",
            namespace: "x",
            files: {
                "foo.js": "export const env = process.env.NODE_ENV"
            },
            outputConfig: { format: "es" }
        };
        const { result: { code, metadata } } = await compile(config);

        expect(pretify(code)).toBe(
            'const env = "development";\nexport { env };'
        );
    });

    it("removes production code when NODE_ENV option is production", async () => {
        const config = {
            ...NODE_ENV_CONFIG,
            outputConfig: { format: "es", env: { NODE_ENV: "production" } }
        };
        const { result: { code, metadata } } = await compile(config);

        expect(pretify(code)).toBe(
            pretify(readFixture("expected-node-env-prod.js"))
        );
    });

    it("does not remove production code when in NODE_ENV option is development", async () => {
        const config = {
            ...NODE_ENV_CONFIG,
            outputConfig: { format: "es", env: { NODE_ENV: "development" } }
        };
        const { result: { code, metadata } } = await compile(config);

        expect(pretify(code)).toBe(
            pretify(readFixture("expected-node-env-dev.js"))
        );
    });
});

describe("metadata output", () => {
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
