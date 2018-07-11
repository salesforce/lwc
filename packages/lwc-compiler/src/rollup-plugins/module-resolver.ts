import * as path from "path";
import { CompilerError } from "../../../../node_modules/lwc-compiler/src/common-interfaces/compiler-error";
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

        resolveId(importee: string, importer: string) {
            if (!isRelativeImport(importee) && importer) {
                return;
            }

            const relPath = importer ? path.dirname(importer) : options.baseDir || "";
            let absPath = path.join(relPath, importee);

            if (!path.extname(importee)) {
                absPath += ".js";
            }

            if (
                !fileExists(absPath, options) &&
                !isTemplateCss(importee, importer)
            ) {
                if (importer) {
                    throw new CompilerError(
                        `Could not resolve '${importee}' (as ${absPath}) from '${importer}'`,
                        importer,
                    );
                }
                throw new CompilerError(
                    `Could not resolve '${importee}' (as ${absPath}) from compiler entry point`,
                    importer,
                );
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
