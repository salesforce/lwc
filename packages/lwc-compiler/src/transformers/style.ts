import postcss from "postcss";
import cssnano from "cssnano";
import postcssPluginLwc from "postcss-plugin-lwc";

import { CompilerError } from "../common-interfaces/compiler-error";
import { NormalizedCompilerOptions, CustomPropertiesResolution } from "../compiler/options";
import { FileTransformerResult } from "./transformer";
import { isUndefined } from "../utils";
import { SourceMap } from "../compiler/compiler";

/**
 * A placeholder string used to locate the style scoping token generated during
 * the CSS transformation.
 */
const TOKEN_PLACEHOLDER = '__TOKEN__';

/** The default stylesheet content if no source has been provided. */
const EMPTY_CSS_OUTPUT = `
const style = undefined;
export default style;
`;

/** The javascript identifier used when custom properties get resolved from a module. */
const CUSTOM_PROPERTIES_IDENTIFIER = 'customProperties';

/**
 * Escape CSS string to injected in a javascript string literal. This method escapes:
 *  - grave accent to avoid conflict with the template string
 *  - back slash to avoid unexpected string escape in the generated CSS
 */
function escapeString(src: string): string {
    return src.replace(/[`\\]/g, (char: string) => {
        return '\\' + char;
    });
}

/**
 * Transform the var() function to a javascript call expression with the name and fallback value.
 */
function transformVar(resolution: CustomPropertiesResolution) {
    if (resolution.type === 'module') {
        return (name: string, fallback?: string): string => {
            let args: string = '`' + name + '`';

            if (!isUndefined(fallback)) {
                args += ', `' + fallback + '`';
            }

            return '${' + CUSTOM_PROPERTIES_IDENTIFIER + '(' + args + ')}';
        };
    }
}

/**
 * Replace token placeholder in the generated CSS string with the actual template string
 * lookup.
 */
function replaceToken(src: string): string {
    const placeholderRegexp = new RegExp(TOKEN_PLACEHOLDER, 'g');
    return src.replace(placeholderRegexp, '${token}');
}

export default async function transformStyle(
    src: string,
    filename: string,
    { stylesheetConfig, outputConfig }: NormalizedCompilerOptions
): Promise<FileTransformerResult> {
    const { minify } = outputConfig;
    const { customProperties } = stylesheetConfig;

    const postcssPlugins: postcss.AcceptedPlugin[] = [];

    // The LWC plugin produces invalid CSS since it transforms all the var function with actual
    // javascript function call. The mification plugin produces invalid CSS when it runs after
    // the LWC plugin.
    if (minify) {
        postcssPlugins.push(
            cssnano({
                preset: ['default'],

                // Disable SVG compression, since it prevent the compiler to be bundle by webpack since
                // it dynamically require the svgo package: https://github.com/svg/svgo
                svgo: false,

                // Disable zindex normalization, since it only works when it works only if the rules
                // css file contains all the selectors applied on the page.
                zindex: false,
            })
        );
    }

    postcssPlugins.push(
        postcssPluginLwc({
            token: TOKEN_PLACEHOLDER,
            customProperties: {
                allowDefinition: customProperties.allowDefinition,
                transformVar: transformVar(customProperties.resolution),
            },
            filename,
        })
    );

    const escapedSource = escapeString(src);

    let res;
    try {
        res = await postcss(postcssPlugins).process(escapedSource, {
            from: filename,
        });
    } catch (e) {
        throw new CompilerError(e.message, filename, e.loc);
    }

    let code: string = '';
    let map: SourceMap | null = { mappings: '' };
    if (res.css && res.css.length) {
        // Add import statement for the custom resolver at the top of the file.
        if (customProperties.resolution.type === 'module') {
            code += `import ${CUSTOM_PROPERTIES_IDENTIFIER} from '${customProperties.resolution.name}';\n`;
        }

        code += [
            'function style(token) {',
            '   return `' + replaceToken(res.css) + '`;',
            '}',
            'export default style;'
        ].join('\n');
        map = null;
    } else {
        code = EMPTY_CSS_OUTPUT;
    }

    return { code, map };
}
