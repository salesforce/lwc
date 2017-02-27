import { basename } from './utils';

export default function (options: any) {
    const sources = options.sources;
    return {
        name : 'source-resolver',

        resolveId: function (id: string) {
            //console.log('[]source-resolver:resolveId', '\t>> ' , id);
            if (basename(id) in sources) {
                return id;
            }
        },
        load (id: string) {
            //console.log('[]source-resolver:load', '\t>> ' , id);
            return sources[basename(id)];
        }
    };
}
