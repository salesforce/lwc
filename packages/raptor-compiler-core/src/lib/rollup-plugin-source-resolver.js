import { basename } from './utils';

export default function (options) {
    const sources = options.sources;
    return {
        name : 'source-resolver',

        resolveId: function (id) {
            //console.log('[]source-resolver:resolveId', '\t>> ' , id);
            if (basename(id) in sources) {
                return id;
            }
        },
        load (id) {
            //console.log('[]source-resolver:load', '\t>> ' , id);
            return sources[basename(id)];
        }
    };
}