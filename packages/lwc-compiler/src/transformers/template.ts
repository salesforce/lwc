import * as path from "path";
import compile from "lwc-template-compiler";
import { NormalizedCompilerOptions } from "../compiler/options";
import { FileTransformer } from "./transformer";

// TODO: once we come up with a strategy to export all types from the module,
// below interface should be removed and resolved from template-compiler module.
export interface TemplateMetadata {
    templateUsedIds: string[];
    definedSlots: string[];
    templateDependencies: string[];
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
    const scopingToken = `${tagName}_${templateFilename}`;

    return [
        `import stylesheet from './${templateFilename}.css'`,
        "",
        src,
        "",

        // The compiler resolves the style import to undefined if the stylesheet
        // doesn't exists.
        `if (stylesheet) {`,

        // The engine picks the style token from the template during rendering to
        // add the token to all generated elements.
        `    tmpl.token = '${scopingToken}';`,
        ``,

        // Inject the component style in a new style tag the document head.
        `    const style = document.createElement('style');`,
        `    style.type = 'text/css';`,
        `    style.dataset.token = '${scopingToken}'`,
        `    style.textContent = stylesheet('${tagName}', '${scopingToken}');`,
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
    options: NormalizedCompilerOptions
) {
    const { code, metadata, warnings } = compile(src, {});

    const fatalError = warnings.find(warning => warning.level === "error");
    if (fatalError) {
        throw new Error(fatalError.message);
    }

    return {
        code: attachStyleToTemplate(code, filename, options),
        metadata,
        map: null
    };
};

export default transform;
