import * as path from "path";
import { MetadataCollector } from "../bundler/meta-collector";
import { NormalizedCompilerOptions } from "../options";

const EMPTY_CSS_CONTENT = ``;

function isRelativeImport(id: string) {
    return id.startsWith(".");
}

function shouldRecordDependency(id: string) {
    return !id.startsWith('babel-compat/') && !id.startsWith('proxy-compat/');
}

function isTemplateCss(id: string, importee: string) {
    return (
        path.extname(id) === ".css" &&
        path.extname(importee) === ".html" &&
        path.basename(id, ".css") === path.basename(importee, ".html")
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
                if (shouldRecordDependency(id)) {
                    metadataCollector.collectReference({
                        name: id,
                        type: "module"
                    });
                }
            } else {
                const relPath = importee ? path.dirname(importee) : "";
                let absPath = path.join(relPath, id);

                if (!path.extname(id)) {
                    absPath += ".js";
                }

                if (
                    !fileExists(absPath, options) &&
                    !isTemplateCss(id, importee)
                ) {
                    throw new Error(
                        `Could not resolve '${id}' from '${importee}'`
                    );
                }
                return absPath;
            }
        },

        load(id: string) {
            return !fileExists(id, options) && path.extname(id) === ".css"
                ? EMPTY_CSS_CONTENT
                : readFile(id, options);
        }
    };
}
