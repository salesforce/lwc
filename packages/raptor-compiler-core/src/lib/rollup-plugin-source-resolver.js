export default function ({ sources = {} } = {}) {
    return {
        name : 'source-resolver',
        resolveId (importee) {
            //console.log('> [source-resolver] - Resolve: ', importee);
        },
        load (id) {
            //console.log('> [source-resolver] - Load: ', id);
            if (sources[id]) {
                return sources[id];
            }
        }
    };
}