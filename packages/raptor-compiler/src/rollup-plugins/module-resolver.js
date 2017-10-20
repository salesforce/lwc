import * as path from 'path';

function isRelativeImport(id) {
    return id.startsWith('.');
}

function shouldRecordDependency(id) {
    return !id.startsWith('babel/helpers/') && !id.startsWith('proxy-compat/');
}

/**
 * Resolve files in the context of raptor modules and store external
 * dependencies
 */
export default function({ moduleResolver, $metadata }) {
    $metadata.rollupDependencies = [];

    return {
        name: 'module-resolver',

        resolveId: function(id, importee) {
            if (!isRelativeImport(id) && importee) {
                if (shouldRecordDependency(id)) {
                    $metadata.rollupDependencies.push(id);
                }
            } else {
                const relPath = importee ? path.dirname(importee) : '';
                let absPath = path.join(relPath, id);

                if (!path.extname(id)) {
                    absPath += '.js';
                }

                return moduleResolver.fileExists(absPath).then(exists => {
                    if (!exists) {
                        throw new Error(
                            `Could not resolve '${id}' from '${importee}'`
                        );
                    }

                    return absPath;
                });
            }
        },

        load(id) {
            return moduleResolver.readFile(id);
        },
    };
}
