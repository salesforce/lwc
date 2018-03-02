import * as postcss from "postcss";
import * as cssnano from "cssnano";
import postcssPluginRaptor from "postcss-plugin-lwc";

import { NormalizedCompilerOptions } from "../options";
import { FileTransformerResult } from "./transformer";
import { MetadataCollector } from "../bundler/meta-collector";

const TOKEN_PLACEHOLDER = "__TOKEN__";
const TAG_NAME_PLACEHOLDER = "__TAG_NAME__";

const EMPTY_CSS_OUTPUT = `
const style = undefined;
export default style;
`;

function generateScopedStyle(src: string) {
    src = src
        .replace(new RegExp(TOKEN_PLACEHOLDER, "g"), "${token}")
        .replace(new RegExp(TAG_NAME_PLACEHOLDER, "g"), "${tagName}");

    return [
        "function style(tagName, token) {",
        "   return `" + src + "`;",
        "}",
        "export default style;"
    ].join("\n");
}

export type StyleMetadata = {};

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
    { outputConfig }: NormalizedCompilerOptions,
    metadataCollector?: MetadataCollector,
): Promise<FileTransformerResult> {
    const plugins = [
        postcssPluginRaptor({
            token: TOKEN_PLACEHOLDER,
            tagName: TAG_NAME_PLACEHOLDER
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
