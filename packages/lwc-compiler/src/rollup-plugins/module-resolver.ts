import * as path from "path";
import { MetadataCollector } from "../bundler/meta-collector";

const EMPTY_CSS_CONTENT = ``;

function isRelativeImport(id: string) {
    return id.startsWith(".");
}

function shouldRecordDependency(id: string) {
    return !id.startsWith("babel/helpers/") && !id.startsWith("proxy-compat/");
}

function isTemplateCss(id: string, importee: string) {
    return (
        path.extname(id) === ".css" &&
        path.extname(importee) === ".html" &&
        path.basename(id, ".css") === path.basename(importee, ".html")
    );
}

/**
 * Resolve files in the context of raptor modules and store external
 * dependencies
 */
export default function({
    metadataCollector,
    moduleResolver
}: {
    metadataCollector: MetadataCollector,
    moduleResolver: any;
}) {
    return {
        name: "module-resolver",

        resolveId: function(id: string, importee: string) {
            if (!isRelativeImport(id) && importee) {
                if (shouldRecordDependency(id)) {
                    metadataCollector.collectReference({ name: id, type: 'module' });
                }
            } else {
                const relPath = importee ? path.dirname(importee) : "";
                let absPath = path.join(relPath, id);

                if (!path.extname(id)) {
                    absPath += ".js";
                }

                return moduleResolver.fileExists(absPath).then((exists: boolean) => {
                    if (!exists && !isTemplateCss(id, importee)) {
                        throw new Error(
                            `Could not resolve '${id}' from '${importee}'`
                        );
                    }
                    return absPath;
                });
            }
        },

        load(id: string) {
            return moduleResolver.fileExists(id).then((exists: boolean) => {
                return !exists && path.extname(id) === ".css"
                    ? EMPTY_CSS_CONTENT
                    : moduleResolver.readFile(id);
            });
        }
    };
}
