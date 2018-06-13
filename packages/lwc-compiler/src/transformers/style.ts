import * as postcss from "postcss";
import * as cssnano from "cssnano";
import postcssPluginLwc from "postcss-plugin-lwc";

import { NormalizedCompilerOptions } from "../compiler/options";
import { FileTransformerResult } from "./transformer";
import { isUndefined } from "../utils";

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

/** The javascript identifier used when custom properties get resolved from a module */
const CUSTOM_PROPERTIES_IDENTIFIER = 'customProperties';

function replaceTokenPlaceholderToLookup(src: string): string {
    const placeholderRegexp = new RegExp(TOKEN_PLACEHOLDER, 'g');
    return src.replace(placeholderRegexp, '${token}');
}

function varFunctionToVarPlaceholder(name: string, fallback: string): string {
    return isUndefined(fallback) ? `__VAR(${name})__` : `__VAR(${name},${fallback})__`;
}

function replaceVarPlaceholderToLookup(src: string): string {
    const placeholderRegexp = /__VAR\((.+)\)__/g;

    return src.replace(placeholderRegexp, (_, value: string) => {
        // Extract the custom property name and fallback value from the placeholder
        const [propertyName, fallback] = value.split(',');

        // Construct the lookup expression for the custom property value.
        const customPropertyRuntimeValue = CUSTOM_PROPERTIES_IDENTIFIER + '["' + propertyName + '"]';
        const fallbackRuntimeValue = isUndefined(fallback) ? '""' : '`' + fallback + '`';
        return '${' + customPropertyRuntimeValue + ' || ' + fallbackRuntimeValue + '}';
    });
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
