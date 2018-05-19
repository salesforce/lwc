import { transform } from "../../transformers/transformer";
import { pretify } from "../../__tests__/utils";

const VALID_TEST_JS = `
import label from '@label/mylabel';
function isTrue() {
    return label;
}
isTrue();
`.trim();

describe("transform", () => {
    it("should validate presence of src", () => {
        expect(() => transform()).toThrow(
            /Expect a string for source. Received undefined/
        );
    });

    it("should validate presence of id", () => {
        expect(() => transform(`console.log('Hello')`)).toThrow(
            /Expect a string for id. Received undefined/
        );
    });

    it("should throw if invalid resolveProxyCompat value is specified in compat mode", async () => {
        expect.assertions(1);
        try {
            const result = await transform(`debugger`, "foo.js", {
                namespace: "x",
                name: "foo",
                outputConfig: {
                    compat: true,
                    resolveProxyCompat: {
                        badkey: "hello"
                    }
                }
            });
        } catch (error) {
            expect(error.message).toBe(
                'Unexpected resolveProxyCompat option, expected property "module", "global" or "independent"'
            );
        }
    });

    it("should throw when invalid javascript file is specified", async () => {
        expect.assertions(1);
        try {
            await transform(`const`, "foo.js", {
                namespace: "x",
                name: "foo"
            });
        } catch (error) {
            // TODO: Figure out how to disable error message code snippet for failing token.
            expect(
                error.message.indexOf("foo.js: Unexpected token (1:5)")
            ).toBe(0);
        }
    });
    it("should apply transformation for valid javascript file", async () => {
        const actual = `
            import { Element } from 'engine';
            export default class Foo extends Element {}
        `;

        const expected = `
            import _tmpl from "./foo.html";
            import { Element } from 'engine';
            export default class Foo extends Element {
                render() {
                    return _tmpl;
                }
            }
            Foo.style = _tmpl.style;
        `;

        const { code } = await transform(actual, "foo.js", {
            namespace: "x",
            name: "foo"
        });
        expect(pretify(code)).toBe(pretify(expected));
    });

    it("should throw when invalid template file is specified", async () => {
        expect.assertions(1);
        try {
            await transform(`<html`, "foo.html", {
                namespace: "x",
                name: "foo"
            });
        } catch (error) {
            // TODO: Figure out how to disable error message code snippet for failing token.
            expect(
                error.message.indexOf("Invalid HTML syntax: eof-in-tag.")
            ).toBe(0);
        }
    });

    it("should apply transformation for template file", async () => {
        const actual = `
            <template>
                <div>Hello</div>
            </template>
        `;


        const expected = `
            import stylesheet from './foo.css'

            export default function tmpl($api, $cmp, $slotset, $ctx) {
                const {
                    t: api_text,
                    h: api_element
                } = $api;

                return [api_element("div", {
                    key: 1
                }, [api_text("Hello")])];
            }

            if (stylesheet) {
                tmpl.token = 'x-foo_foo';

                const style = document.createElement('style');
                style.type = 'text/css';
                style.dataset.token = 'x-foo_foo'
                style.textContent = stylesheet('x-foo', 'x-foo_foo');
                document.head.appendChild(style);
            }
        `;

        const { code } = await transform(actual, "foo.html", {
            namespace: "x",
            name: "foo"
        });

        expect(pretify(code)).toBe(pretify(expected));
    });

    it("should throw when invalid tempalte file is specified", async () => {
        expect.assertions(1);
        try {
            await transform(`<`, "foo.css", {
                namespace: "x",
                name: "foo"
            });
        } catch (error) {
            expect(error.message).toBe("<css input>:1:1: Unknown word");
        }
    });

    it("should apply transformation for stylesheet file", async () => {
        const actual = `
            div {
                background-color: red;
            }
        `;

        const expected = `
            function style(tagName, token) {
                return \`
            div[\${token}] {
                background-color: red;
            }
                \`;
            }
            export default style;
        `;

        const { code } = await transform(actual, "foo.css", {
            namespace: "x",
            name: "foo"
        });

        expect(pretify(code)).toBe(pretify(expected));
    });

    it("javascript metadata", async () => {
        const content = `
            import { Element, api } from 'engine';
            /** Foo doc */
            export default class Foo extends Element {
                _privateTodo;
                @api get todo () {
                    return this._privateTodo;
                }
                @api set todo (val) {
                    return this._privateTodo = val;
                }
                @api
                index;
            }
        `;

        const result = await transform(content, "foo.js", {
            namespace: "x",
            name: "foo"
        });

        const metadata = result.metadata;

        expect(metadata.decorators).toEqual([
            {
                type: "api",
                targets: [
                    { type: "property", name: "todo" },
                    { type: "property", name: "index" }
                ]
            }
        ]);
        expect(metadata.doc).toBe("Foo doc");
        expect(metadata.declarationLoc).toEqual({
            start: { line: 4, column: 12 },
            end: { line: 14, column: 13 }
        });
    });
});
