import * as postcss from "postcss";
import * as cssnano from "cssnano";
import * as balanced from "balanced-match";
import postcssPluginLwc from "postcss-plugin-lwc";

import { isUndefined } from "../utils";

import { NormalizedCompilerOptions } from "../compiler/options";
import { FileTransformerResult } from "./transformer";

/**
 * A placeholder string used to locate the style scoping token generated during
 * the CSS transformation.
 */
const TOKEN_PLACEHOLDER = '__TOKEN__';

/** The default stylesheet content if no source has been provided */
const EMPTY_CSS_OUTPUT = `
const style = undefined;
export default style;
`;

/**
 * A set of recognizable strings used when transforming the CSS to later find easily
 * occurrences of var() functions in the generated CSS.
 */
const VAR_FUNCTION_PLACEHOLDER_PRE = '__VAR(';
const VAR_FUNCTION_PLACEHOLDER_POST = ')RAV__';
const VAR_FUNCTION_PLACEHOLDER_SEPARATOR = '||';

/** The javascript identifier used when custom properties get resolved from a module */
const CUSTOM_PROPERTIES_IDENTIFIER = 'customProperties';

function replaceTokenPlaceholderToLookup(src: string): string {
    const placeholderRegexp = new RegExp(TOKEN_PLACEHOLDER, 'g');
    return src.replace(placeholderRegexp, '${token}');
}

function varFunctionToVarPlaceholder(name: string, fallback: string): string {
    const args = isUndefined(fallback)
        ? name
        : name + VAR_FUNCTION_PLACEHOLDER_SEPARATOR + fallback;
    return VAR_FUNCTION_PLACEHOLDER_PRE + args + VAR_FUNCTION_PLACEHOLDER_POST;
}

function replaceVarPlaceholderToLookup(src: string): string {
    let match;

    while (
        match = balanced(VAR_FUNCTION_PLACEHOLDER_PRE, VAR_FUNCTION_PLACEHOLDER_POST, src)
    ) {
        const { pre, body, post } = match;

        const separatorLocation = body.indexOf(VAR_FUNCTION_PLACEHOLDER_SEPARATOR);
        const propertyName = body.slice(0, separatorLocation);

        let fallback = undefined;
        if (separatorLocation !== -1) {
            fallback = body.slice(separatorLocation + VAR_FUNCTION_PLACEHOLDER_SEPARATOR.length);
        }
        const args = [propertyName, fallback].filter(x => x).map(prop => '`' + prop + '`').join(', ');

        const customPropertyExpression = '${' + CUSTOM_PROPERTIES_IDENTIFIER + '(' + args + ')}';

        src = pre + customPropertyExpression + post;

        console.log(src);
    }

    return src;
}

function generateStyle(src: string, resolveFromModule?: string) {
    let prefix = '';
    let output = replaceTokenPlaceholderToLookup(src);

    if (resolveFromModule) {
        prefix = `import ${CUSTOM_PROPERTIES_IDENTIFIER} from '${resolveFromModule}';\n`;
        output = replaceVarPlaceholderToLookup(output);
    }

    return [
        prefix,
        "function style(token) {",
        "   return `" + output + "`;",
        "}",
        "export default style;"
    ].join("\n");
}

export default async function transformStyle(
    src: string,
    filename: string,
    { stylesheetConfig, outputConfig }: NormalizedCompilerOptions
): Promise<FileTransformerResult> {
    const { minify } = outputConfig;
    const { customProperties } = stylesheetConfig;

    // If the custom properties need to get resolved at runtime from a module, we need
    // to find their locations of all the custom properties usage in the stylesheet first.
    // Otherwise we let them untouched to rely on the native behavior at runtime.
    const transformVar = customProperties.resolveFromModule ?
        varFunctionToVarPlaceholder :
        undefined;

    const plugins = [
        postcssPluginLwc({
            token: TOKEN_PLACEHOLDER,
            customProperties: {
                allowDefinition: customProperties.allowDefinition,
                transformVar,
            }
        })
    ];

    if (minify) {
        plugins.push(
            cssnano({
                svgo: false,
                preset: ["default"]
            })
        );
    }

    const res = await postcss(plugins).process(src, {
        from: undefined,
    });

    let code: string;
    if (res.css && res.css.length) {
        code = generateStyle(res.css, customProperties.resolveFromModule);
    } else {
        code = EMPTY_CSS_OUTPUT;
    }

    return { code, map: null };
}
