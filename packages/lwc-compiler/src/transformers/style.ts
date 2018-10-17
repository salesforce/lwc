import * as path from "path";
import postcss from "postcss";
import cssnano from "cssnano";
import { normalizeCompilerError } from "lwc-errors";
import postcssPluginLwc from "postcss-plugin-lwc";

import { NormalizedCompilerOptions, CustomPropertiesResolution } from "../compiler/options";
import { FileTransformerResult } from "./transformer";
import { isUndefined } from "../utils";

/**
 * The javascript identifiers used to build the style factory function.
 */
const HOST_SELECTOR_IDENTIFIER = 'hostSelector';
const SHADOW_SELECTOR_IDENTIFIER = 'shadowSelector';

/**
 * A placeholder string used to locate the style scoping selectors generated during
 * the CSS transformation.
 */
const HOST_SELECTOR_PLACEHOLDER = '__HOST_TOKEN__';
const SHADOW_SELECTOR_PLACEHOLDER = '__TOKEN__';

/** The default stylesheet content if no source has been provided. */
const EMPTY_CSS_OUTPUT = `
const stylesheet = undefined;
export default stylesheet;
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
    const hostRegexp = new RegExp(HOST_SELECTOR_PLACEHOLDER, 'g');
    const shadowRegexp = new RegExp(SHADOW_SELECTOR_PLACEHOLDER, 'g');
    return src.replace(hostRegexp, '${' + HOST_SELECTOR_IDENTIFIER + '}').replace(shadowRegexp, '${' + SHADOW_SELECTOR_IDENTIFIER + '}');
}

export default async function transformStyle(
    src: string,
    filename: string,
    { name, namespace, stylesheetConfig, outputConfig }: NormalizedCompilerOptions
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
            hostSelector: HOST_SELECTOR_PLACEHOLDER,
            shadowSelector: SHADOW_SELECTOR_PLACEHOLDER,
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
        throw normalizeCompilerError(e, { filename, location: e.loc });
    }

    let code: string = '';
    if (res.css && res.css.length) {
        // Add import statement for the custom resolver at the top of the file.
        if (customProperties.resolution.type === 'module') {
            code += `import ${CUSTOM_PROPERTIES_IDENTIFIER} from '${customProperties.resolution.name}';\n`;
        }

        // Use the module namespace, name and file name to generate a unique attribute name to scope
        // the styles.
        const scopingAttribute = `${namespace}-${name}_${path.basename(filename, path.extname(filename))}`;

        code += [
            'function factory(' + HOST_SELECTOR_IDENTIFIER + ', ' + SHADOW_SELECTOR_IDENTIFIER + ') {',
            '    return `' + replaceToken(res.css) + '`;',
            '}',
            '',
            'export default {',
            '    factory,',
            `    hostAttribute: '${scopingAttribute}-host',`,
            `    shadowAttribute: '${scopingAttribute}',`,
            '};',
        ].join('\n');
    } else {
        code = EMPTY_CSS_OUTPUT;
    }

    // Rollup only cares about the mappings property on the map. Since producing a source map for
    // the styles doesn't make sense, the transform returns an empty mappings.
    return { code, map: { mappings: '' } };
}
