import * as path from "path";
import { ModuleResolutionErrors, generateCompilerError } from 'lwc-errors';

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
    filename: string,
    options: NormalizedCompilerOptions
): string {
    const { files } = options;

    if (fileExists(filename, options)) {
        return files[filename];
    } else {
        throw generateCompilerError(ModuleResolutionErrors.NONEXISTENT_FILE, {
            messageArgs: [filename],
            context: {filename}
        });
    }
}

export default function({
    options
}: {
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
                    throw generateCompilerError(ModuleResolutionErrors.IMPORTEE_RESOLUTION_FROM_IMPORTER_FAILED, {
                        messageArgs: [ importee, importer ],
                        context: { filename: importer }
                    });
                }
                throw generateCompilerError(ModuleResolutionErrors.IMPORTEE_RESOLUTION_FAILED, {
                    messageArgs: [importee],
                    context: { filename: importer }
                });
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
