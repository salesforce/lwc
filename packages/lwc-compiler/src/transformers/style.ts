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

/** The default stylesheet content if no source has been provided. */
const EMPTY_CSS_OUTPUT = `
const style = undefined;
export default style;
`;

/** The javascript identifier used when custom properties get resolved from a module. */
const CUSTOM_PROPERTIES_IDENTIFIER = 'customProperties';

/**
 * Transform the var() function to a javascript call expression with the name and fallback value.
 */
function transformVar(resolveFromModule?: string) {
    if (!isUndefined(resolveFromModule)) {
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
    _filename: string,
    { stylesheetConfig, outputConfig }: NormalizedCompilerOptions
): Promise<FileTransformerResult> {
    const { minify } = outputConfig;
    const { customProperties } = stylesheetConfig;

    const plugins = [
        postcssPluginLwc({
            token: TOKEN_PLACEHOLDER,
            customProperties: {
                allowDefinition: customProperties.allowDefinition,
                transformVar: transformVar(customProperties.resolveFromModule),
            }
        })
    ];

    if (minify) {
        plugins.push(
            cssnano({
                svgo: false,
                preset: ['default']
            })
        );
    }

    const res = await postcss(plugins).process(src, {
        from: undefined,
    });

    let code: string = '';
    if (res.css && res.css.length) {
        // Add import statement for the custom resolver at the top of the file.
        if (customProperties.resolveFromModule) {
            code += `import ${CUSTOM_PROPERTIES_IDENTIFIER} from '${customProperties.resolveFromModule}';\n`;
        }

        code += [
            'function style(token) {',
            '   return `' + replaceToken(res.css) + '`;',
            '}',
            'export default style;'
        ].join('\n');
    } else {
        code = EMPTY_CSS_OUTPUT;
    }

    return { code, map: null };
}
