import * as path from "path";
import compile from "lwc-template-compiler";
import { NormalizedCompilerOptions } from "../options";
import { FileTransformer } from "./transformer";
import { MetadataCollector } from "../bundler/meta-collector";

// TODO: once we come up with a strategy to export all types from the module,
// below interface should be removed and resolved from template-compiler module.
export interface TemplateMetadata {
    templateUsedIds: string[];
    definedSlots: string[];
    templateDependencies: string[];
}

export function getTemplateToken(name: string, namespace: string) {
    const templateId = path.basename(name, path.extname(name));
    return `${namespace}-${name}_${templateId}`;
}

/**
 * Transforms a HTML template into module exporting a template function.
 * The transform also add a style import for the default stylesheet associated with
 * the template regardless if there is an actual style or not.
 */
const transform: FileTransformer = function(
    src: string,
    filename: string,
    options: NormalizedCompilerOptions,
    metadataCollector?: MetadataCollector
) {
    const { name, namespace } = options;
    const { code: template, metadata, warnings } = compile(src, {});

    const fatalError = warnings.find(warning => warning.level === "error");
    if (fatalError) {
        throw new Error(fatalError.message);
    }

    const token = getTemplateToken(name, namespace);
    const cssName = path.basename(name, path.extname(name)) + ".css";

    const code = [
        `import style from './${cssName}'`,
        "",
        template,
        "",
        `if (style) {`,
        `   const tagName = '${namespace}-${name}';`,
        `   const token = '${token}';`,
        ``,
        `   tmpl.token = token;`,
        `   tmpl.style = style(tagName, token);`,
        `}`
    ].join("\n");

    return { code, map: null };
};

export default transform;
