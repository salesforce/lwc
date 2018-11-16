import { compile } from "../index";
import { readFixture, pretify } from "./utils";

describe("inline styles", () => {
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
});
