import * as path from "path";
import compile from "lwc-template-compiler";

import { FileTransformer } from "./transformer";
import { CompilerError } from "../common-interfaces/compiler-error";

// TODO: once we come up with a strategy to export all types from the module,
// below interface should be removed and resolved from template-compiler module.
export interface TemplateMetadata {
    templateUsedIds: string[];
    definedSlots: string[];
    templateDependencies: string[];
}

/**
 * Transforms a HTML template into module exporting a template function.
 * The transform also add a style import for the default stylesheet associated with
 * the template regardless if there is an actual style or not.
 */
const transform: FileTransformer = function(
    src: string,
    filename: string,
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

        const fatalError = result.warnings.find(warning => warning.level === "error");
        if (fatalError) {
            throw new CompilerError(`${filename}: ${fatalError.message}`, filename);
        }
    } catch (e) {
        throw new CompilerError(e.message, filename, e.loc);
    }

    return {
        code,
        metadata,
        map: null
    };
};

export default transform;
