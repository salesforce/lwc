import { readFile } from "fs";
import { compile } from "../../index";
import { fixturePath, readFixture, pretify } from "../../__tests__/utils";

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
