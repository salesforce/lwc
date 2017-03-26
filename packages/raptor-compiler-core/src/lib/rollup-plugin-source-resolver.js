import { dirname, join, extname } from './utils';

export default function (options: any) {
    const sources = options.sources;
    return {
        name : 'source-resolver',

        // NOTE: All sources must be relative to the entry point
        // Ex. If entry: 'foo/bar/mycmp.js, all dependencies will be relative like 'foo/bar/other/dep.js'
        resolveId: function (id: string, importee: string) {
            //console.log('[]source-resolver:resolveId', '\t>> ' , id, importee);
            const ext = extname(id);
            const path = importee ? dirname(importee) : '';
            let relativePath = join(path, id);

            if (!ext) {
                relativePath += '.js';
            }

            if (relativePath in sources) {
                return relativePath;
            }
        },
        load (id: string) {
            //console.log('[]source-resolver:load', '\t>> ' , id);
            return sources[id];
        }
    };
}
