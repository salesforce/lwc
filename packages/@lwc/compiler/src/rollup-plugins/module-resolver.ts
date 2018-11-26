import * as path from "path";
import { ModuleResolutionErrors, generateCompilerError } from '@lwc/errors';

import { NormalizedCompilerOptions } from "../compiler/options";

const EMPTY_IMPLICIT_CSS_CONTENT = '';
const EMPTY_IMPLICIT_HTML_CONTENT = 'export default void 0';
const IMPLICIT_DEFAULT_HTML_PATH = '@lwc/resources/empty_html.js';
const IMPLICIT_DEFAULT_CSS_PATH = '@lwc/resources/empty_css.css';

function isRelativeImport(id: string) {
    return id.startsWith(".");
}

function isImplicitCssImport(id: string, importee: string) {
    return (
        path.extname(id) === ".css" &&
        path.extname(importee) === ".html" &&
        path.basename(id, ".css") === path.basename(importee, ".html")
    );
}

function isImplicitHTMLImport(importee: string, importer: string) {
    return (
        importer &&
        path.extname(importer) === ".js" &&
        path.extname(importee) === '.html' &&
        path.dirname(importer) === path.dirname(importee) &&
        path.basename(importer, '.js') === path.basename(importee, '.html')
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
            origin: {filename}
        });
    }
}

export default function({ options }: { options: NormalizedCompilerOptions }) {
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

            if (!fileExists(absPath, options)) {
                if (isImplicitCssImport(importee, importer)) {
                    return IMPLICIT_DEFAULT_CSS_PATH;
                }

                if (isImplicitHTMLImport(absPath, importer)) {
                    return IMPLICIT_DEFAULT_HTML_PATH;
                }

                if (importer) {
                    throw generateCompilerError(ModuleResolutionErrors.IMPORTEE_RESOLUTION_FROM_IMPORTER_FAILED, {
                        messageArgs: [ importee, importer ],
                        origin: { filename: importer }
                    });
                }
                throw generateCompilerError(ModuleResolutionErrors.IMPORTEE_RESOLUTION_FAILED, {
                    messageArgs: [importee],
                    origin: { filename: importer }
                });
            }
            return absPath;
        },

        load(id: string) {
            if (id === IMPLICIT_DEFAULT_CSS_PATH) {
                return EMPTY_IMPLICIT_CSS_CONTENT;
            }

            if (id === IMPLICIT_DEFAULT_HTML_PATH) {
                return EMPTY_IMPLICIT_HTML_CONTENT;
            }

            return path.extname(id) === ".css" && !fileExists(id, options)
                ? EMPTY_IMPLICIT_CSS_CONTENT
                : readFile(id, options);
        }
    };
}
