import * as path from "path";
import { NormalizedCompilerOptions } from "../options";
import compile from "lwc-template-compiler";
import { FileTransformer } from "./transformer";
import { MetadataCollector } from "../bundler/meta-collector";
import { CompilationMetadata } from "../../../lwc-template-compiler/dist/types/shared/types";

export function getTemplateToken(name: string, namespace: string) {
    const templateId = path.basename(name, path.extname(name));
    return `${namespace}-${name}_${templateId}`;
}

/**
 * Transforms a HTML template into module exporting a template function.
 * The transform also add a style import for the default stylesheet associated with
 * the template regardless if there is an actual style or not.
 */

 export type TemplateMetadata = CompilationMetadata;

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

    if (metadataCollector) {
        metadata.templateDependencies.forEach(name => {
            metadataCollector.collectReference({ name, type: "component" });
        });
    }

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
