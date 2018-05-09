import * as path from "path";
import { MetadataCollector } from "../bundler/meta-collector";
import { NormalizedCompilerOptions } from "../compiler/options";

const EMPTY_CSS_CONTENT = ``;

function isRelativeImport(id: string) {
    return id.startsWith(".");
}

function isTemplateCss(id: string, importee: string) {
    return (
        path.extname(id) === ".css" &&
        path.extname(importee) === ".html" &&
        path.basename(id, ".css") === path.basename(importee, ".html")
    );
}

/**
 * This method allows resolver to process custom template files by gracefully handling an attempt to match a css file to it.
 * Background: per design, bundle will have only one css file, which is named after the component name.
 *
 * ex: my-cmp/
 *          my-cmp.js
 *          my-cmp.html         --> html file is named the same as js.
 *                                  this file will be checked against my-cmp.css ( css may not exist, but
 *                                  resolveId method will treat it as TemplateCss, because names match )
 *
 *          customTemplate.html --> when custom template is resolved, module resolver attempts to check
 *                                     for css file existence with the same name. However, since css is
 *                                     hardcoded with javascript name - my-cmp.css, it won't pass isTemplateCss check
 */
function isCustomTemplateImportee(id: string, importee: string) {
    return (
        path.extname(id) === ".css" &&
        path.extname(importee) === ".html" &&
        path.basename(id, ".css") !== path.basename(importee, ".html")
    );
}

function fileExists(
    fileName: string,
    { files }: NormalizedCompilerOptions
): boolean {
    return files.hasOwnProperty(fileName);
}

function readFile(
    fileName: string,
    options: NormalizedCompilerOptions
): string {
    const { files } = options;

    if (fileExists(fileName, options)) {
        return files[fileName];
    } else {
        throw new Error(`No such file ${fileName}`);
    }
}

export default function({
    metadataCollector,
    options
}: {
    metadataCollector: MetadataCollector;
    options: NormalizedCompilerOptions;
}) {
    return {
        name: "lwc-module-resolver",

        resolveId(id: string, importee: string) {
            if (!isRelativeImport(id) && importee) {
                return;
            }

            const relPath = importee ? path.dirname(importee) : "";
            let absPath = path.join(relPath, id);

            if (!path.extname(id)) {
                absPath += ".js";
            }

            if (
                !fileExists(absPath, options) &&
                !isTemplateCss(id, importee) &&
                !isCustomTemplateImportee(id, importee)
            ) {
                throw new Error(`Could not resolve '${id}' from '${importee}'`);
            }
            return absPath;
        },

        load(id: string) {
            return !fileExists(id, options) && path.extname(id) === ".css"
                ? EMPTY_CSS_CONTENT
                : readFile(id, options);
        }
    };
}
