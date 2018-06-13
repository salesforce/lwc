import * as postcss from "postcss";
import * as cssnano from "cssnano";
import postcssPluginRaptor from "postcss-plugin-lwc";

import { NormalizedCompilerOptions } from "../compiler/options";
import { FileTransformerResult } from "./transformer";

const TOKEN_PLACEHOLDER = "__TOKEN__";

const EMPTY_CSS_OUTPUT = `
const style = undefined;
export default style;
`;

function generateScopedStyle(src: string) {
    const srcWithTemplateString = src.replace(new RegExp(TOKEN_PLACEHOLDER, "g"), "${token}");

    return [
        "function style(token) {",
        "   return `" + srcWithTemplateString + "`;",
        "}",
        "export default style;"
    ].join("\n");
}

/**
 * Transforms a css string into a module exporting a function producing a stylesheet.
 * The produced function accepts 2 parameters, tagName and token to enforce style scoping.
 *
 *      export default function style({ token, style }) {
 *          return `div[${token}] { background-color: red; }`;
 *      }
 *
 * In the case where the stylesheet the produced module exports undefined.
 *
 *      export default undefined;
 */
export default function transformStyle(
    src: string,
    filename: string,
    { outputConfig }: NormalizedCompilerOptions
): Promise<FileTransformerResult> {
    const plugins = [
        postcssPluginRaptor({
            token: TOKEN_PLACEHOLDER,
        })
    ];

    if (outputConfig && outputConfig.minify) {
        plugins.push(
            cssnano({
                svgo: false,
                preset: ["default"]
            })
        );
    }

    return postcss(plugins)
        .process(src, { from: undefined })
        .then(res => {
            const code =
                res.css && res.css.length
                    ? generateScopedStyle(res.css)
                    : EMPTY_CSS_OUTPUT;

            return { code, map: null };
        });
}
