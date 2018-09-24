import postcss from "postcss";
import cssnano from "cssnano";
import { sha256 } from 'hash.js';
import postcssPluginLwc from "postcss-plugin-lwc";

import { CompilerError } from "../common-interfaces/compiler-error";
import { NormalizedCompilerOptions, CustomPropertiesResolution } from "../compiler/options";
import { FileTransformerResult } from "./transformer";
import { isUndefined } from "../utils";

/** Length of the hash used to generate CSS token */
const HASH_LENGTH = 5;

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
 * Generate a unique token to be used for CSS scoping.
 * This token is composed of component name, namespace and a hash generated from the CSS source.The
 * only case where two component will have an identical token is when both of them have the same
 * component name and CSS source.
 *
 * TODO: name and namespaced are added into the token value for debugging purposes. We should revise
 * the token value once the compiler supports source-map.
 */
function generateToken(src: string, name: string, namespace: string) {
    const hash = sha256().update(src).digest('hex').slice(0, HASH_LENGTH);
    return `${name}-${namespace}-${hash}`;
}

export default async function transformStyle(
    src: string,
    filename: string,
    { name, namespace, stylesheetConfig, outputConfig }: NormalizedCompilerOptions
): Promise<FileTransformerResult> {

    // The compiler automatically resolves the CSS for the component template. Therefore, if the CSS
    // file is not found, the loader returns an empty CSS source. In order to keep the generated code
    // minimal, we only return the stylesheet object when the CSS source is not empty.
    if (!src.length) {
        return { code: EMPTY_CSS_OUTPUT, map: null };
    }

    const token = generateToken(src, name, namespace);
    const postcssPlugins: postcss.AcceptedPlugin[] = [];

    // The LWC plugin produces invalid CSS since it transforms all the var function with actual
    // javascript function call. The minification plugin produces invalid CSS when it runs after
    // the LWC plugin.
    if (outputConfig.minify) {
        postcssPlugins.push(
            cssnano({
                svgo: false,
                preset: ['default']
            })
        );
    }

    const { customProperties } = stylesheetConfig;
    postcssPlugins.push(
        postcssPluginLwc({
            token,
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

    // Add import statement for the custom resolver at the top of the file.
    if (customProperties.resolution.type === 'module') {
        code += `import ${CUSTOM_PROPERTIES_IDENTIFIER} from '${customProperties.resolution.name}';\n`;
    }

    code += [
        'export default {',
        `   hostToken: '${token}-host',`,
        `   shadowToken: '${token}',`,
        `   content: \`${res.css}\`,`,
        '}'
    ].join('\n');

    return { code, map: null };
}
