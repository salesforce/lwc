import {rollup} from 'rollup';
import {normalizeEntryPath} from './lib/utils';
import classTransformer from './lib/rollup-plugin-class-transformer';
import sourceResolver from './lib/rollup-plugin-source-resolver';
import templateParser from './lib/rollup-plugin-template-parser';
import annotationsTransform from './lib/rollup-plugin-remove-annotations';
import { transform as optimizeClassTransform } from './lib/class-optimization-transform';

const BASE_CONFIG = {
    babelConfig: { babelrc: false },
    sharedMetadata: {}
};

const plugins = [
    annotationsTransform,
    sourceResolver,
    templateParser,
    classTransformer,
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
            const result = optimizeClassTransform(bundleResult.code, BASE_CONFIG);
            resolve(result);
        })
        .catch((err) => {
            reject(err);
        });
    });
}