import babel from 'rollup-plugin-babel';
import injectTemplate from './lib/injectTemplate';
import {rollup} from 'rollup';

function moduleResolver ({ sources = {} } = {}) {
    return {
        name : 'moduleResolver',
        resolveId (importee, importer) {
            console.log('> resolve:', importee, importer);
        },
        load (id) {
            console.log('> Load resource: ', id);
            if (sources[id]) {
                return sources[id];
            }
        }
    };
}

const entry = 'test/fixtures/classAndTemplate/classAndTemplate.js';

const BASE_CONFIG = {
    babelRenderMethod: {
        babelrc: false,
       // presets: ['react'],
        plugins: [
            [injectTemplate, { name: 'classAndTemplate.html' }],
        ]
    }
};

const plugins = [
    moduleResolver(BASE_CONFIG),
];

rollup({
    entry,
    plugins
})
.then((bundle) => {
    console.log(bundle.generate({}).code);
})
.catch((err) => {
    console.log(err);
});