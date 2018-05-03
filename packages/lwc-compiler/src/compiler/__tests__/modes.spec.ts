import { readFile } from "fs";
import { compile } from "../../index";
import { fixturePath, readFixture, pretify } from "../../__tests__/utils";

const NODE_ENV_CONFIG = {
    name: "node_env",
    namespace: "x",
    files: {
        "node_env.js": readFixture("node_env/node_env.js"),
        "node_env.html": readFixture("node_env/node_env.html")
    },
    outputConfig: { format: "es" }
};

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
