import { dirname, join, extname } from './utils';

export default function (options) {
    const sources = options.sources;
    const meta = options.$metadata;
    meta.rollupDependencies = [];

    return {
        name : 'source-resolver',

        // NOTE: All sources must be relative to the entry point
        // Ex. If entry: 'foo/bar/mycmp.js, all dependencies will be relative like 'foo/bar/other/dep.js'
        resolveId: function (id, importee) {
            //console.log('[]source-resolver:resolveId', '\t>> ' , id, importee);
            const extension = extname(id);
            const externalModule = id[0] !== '.';
            const path = importee ? dirname(importee) : '';
            let relativePath = join(path, id);

            if (externalModule && importee) {
                meta.rollupDependencies.push(id);
            }

            if (!extension) {
                relativePath += '.js';
            }

            if (relativePath in sources) {
                return relativePath;
            }
        },
        load (id) {
            //console.log('[]source-resolver:load', '\t>> ' , id);
            return sources[id];
        }
    };
}
