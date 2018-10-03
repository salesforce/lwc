import * as path from "path";
import compile from "lwc-template-compiler";

import { CompilerError } from "../common-interfaces/compiler-error";
import { NormalizedCompilerOptions } from "../compiler/options";
import { FileTransformer } from "./transformer";
import { TemplateModuleDependency } from "lwc-template-compiler";
import { MetadataCollector } from "../bundler/meta-collector";

// TODO: once we come up with a strategy to export all types from the module,
// below interface should be removed and resolved from template-compiler module.
export interface TemplateMetadata {
    templateUsedIds: string[];
    definedSlots: string[];
    templateDependencies: TemplateModuleDependency[];
}

function attachStyleToTemplate(
    src: string,
    filename: string,
    options: NormalizedCompilerOptions
) {
    const { name, namespace } = options;

    const templateFilename = path.basename(filename, path.extname(filename));

    // Use the component tagname and a unique style token to scope the compiled
    // styles to the component.
    const tagName = `${namespace}-${name}`;
    const shadowToken = `${tagName}_${templateFilename}`;
    const hostToken = `${shadowToken}-host`;

    return [
        `import stylesheet from './${templateFilename}.css'`,
        "",
        src,
        "",

        // The compiler resolves the style import to undefined if the stylesheet
        // doesn't exists.
        `if (stylesheet) {`,

        // The engine picks the tokens from the template during rendering:
        // * `hostToken`: is applied only to the host element
        // * `shadowToken`: is applied to all the element generated by the template
        `    tmpl.hostToken = '${hostToken}';`,
        `    tmpl.shadowToken = '${shadowToken}';`,
        ``,

        // Inject the component style in a new style tag the document head.
        `    const style = document.createElement('style');`,
        `    style.type = 'text/css';`,
        `    style.dataset.token = '${shadowToken}'`,
        `    style.textContent = stylesheet('${shadowToken}');`,
        `    document.head.appendChild(style);`,
        `}`
    ].join("\n");
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

    let code;
    let metadata;

    try {
        const result = compile(src, {});
        const warnings = result.warnings;

        code = result.code;
        metadata = result.metadata;

        if (metadataCollector) {
            metadataCollector.collectExperimentalTemplateDependencies(filename, metadata.templateDependencies);
        }

        const fatalError = warnings.find(warning => warning.level === "error");
        if (fatalError) {
            throw new CompilerError(`${filename}: ${fatalError.message}`, filename);
        }
    } catch (e) {
        throw new CompilerError(e.message, filename, e.loc);
    }

    // returning { mappings: '' } since this is not debuggable code.
    return {
        code: attachStyleToTemplate(code, filename, options),
        metadata,
        map: { mappings: '' }
    };
};

export default transform;
