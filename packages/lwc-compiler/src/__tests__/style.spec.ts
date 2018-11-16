import { compile } from "../index";
import { readFixture, pretify } from "./utils";

describe("styles", () => {
    it("inline import works", async () => {
        const { result } = await compile({
            name: 'inline_style',
            namespace: 'x',
            files: {
                'inline_style.js': readFixture("inline_style/inline_style.js"),
                'inline_style.html': readFixture("inline_style/inline_style.html")
            },
            outputConfig: {
                compat: false,
                format: 'es',
            }
        });

        expect(pretify(result.code)).toBe(
            pretify(readFixture("expected-inline-styles.js"))
        );
    });

    it("external import works", async () => {
        const { result } = await compile({
            name: 'external_style',
            namespace: 'x',
            files: {
                'external_style.js': readFixture("external_style/external_style.js"),
                'external_style.html': readFixture("external_style/external_style.html"),
                'external_style.css': readFixture("external_style/external_style.css")
            },
            outputConfig: {
                compat: false,
                format: 'es',
            }
        });

        expect(pretify(result.code)).toBe(
            pretify(readFixture("expected-external-styles.js"))
        );
    });
});
