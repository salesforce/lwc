import * as path from "path";
import { convertDiagnosticToCompilerError, normalizeToCompilerError, DiagnosticLevel, TransformerErrors } from "lwc-errors";
import compile from "lwc-template-compiler";
import { TemplateModuleDependency } from "lwc-template-compiler";

import { FileTransformer } from "./transformer";
import { MetadataCollector } from "../bundler/meta-collector";
import { NormalizedCompilerOptions } from "../compiler/options";

// TODO: once we come up with a strategy to export all types from the module,
// below interface should be removed and resolved from template-compiler module.
export interface TemplateMetadata {
    templateUsedIds: string[];
    definedSlots: string[];
    templateDependencies: TemplateModuleDependency[];
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

        // Bind template with associated stylesheet.
        const cssRelPath = `./${path.basename(filename, path.extname(filename))}.css`;
        code = [
            `import stylesheet from '${cssRelPath}';`,
            ``,
            result.code,
            ``,
            `if (stylesheet) {`,
            `    tmpl.stylesheet = stylesheet;`,
            `}`
        ].join('\n');

        metadata = result.metadata;

        if (metadataCollector) {
            metadataCollector.collectExperimentalTemplateDependencies(filename, metadata.templateDependencies);
        }

        const fatalError = result.warnings.find(warning => warning.level === DiagnosticLevel.Error);
        if (fatalError) {
            throw convertDiagnosticToCompilerError(fatalError, { filename });
        }
    } catch (e) {
        throw normalizeToCompilerError(TransformerErrors.HTML_TRANSFORMER_ERROR, e, { filename });
    }

    // Rollup only cares about the mappings property on the map. Since producing a source map for
    // the template doesn't make sense, the transform returns an empty mappings.
    return {
        code,
        metadata,
        map: { mappings: '' }
    };
};

export default transform;
