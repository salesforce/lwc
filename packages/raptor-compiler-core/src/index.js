import {rollup} from 'rollup';
import {normalizeEntryPath} from './lib/utils';
import sourceResolver from './lib/rollup-plugin-source-resolver';
import removeAnnotations from './lib/rollup-plugin-remove-annotations';
import templateParser from './lib/rollup-plugin-template-parser';
import transformClass from './lib/rollup-plugin-transform-class';

const BASE_CONFIG = {
    babelConfig: { babelrc: false }
};

const plugins = [
    sourceResolver,
    removeAnnotations,
    templateParser,
    transformClass,
];

export function compile(config, options = {}) {
    let componentPath = config.componentPath;
    let entry = config.entry;

    options = Object.assign({}, BASE_CONFIG, options);

    if (componentPath) {
        entry = normalizeEntryPath(componentPath);
    }

    if (options.minify) {
        console.log('TODO!');
    }

    return new Promise((resolve, reject) => {
        rollup({
            entry,
            plugins : plugins.map((pluginConfig) => {
                if (Array.isArray(pluginConfig)) {
                    let [plugin, pluginOptions] = pluginConfig;
                    pluginOptions = Object.assign({}, BASE_CONFIG, pluginOptions);
                    return plugin(pluginOptions);
                }

                return pluginConfig(BASE_CONFIG);
                
            })
        })
        .then((bundle) => {
            const bundleResult = bundle.generate({});
            resolve(bundleResult);
        })
        .catch((err) => {
            reject(err);
        });
    });
}