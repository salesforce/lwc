import classTransformer from './lib/rollup-plugin-class-transformer';
import flowPlugin from './lib/rollup-plugin-flow';
import {normalizeEntryPath} from './lib/utils';
import { transform as optimizeClassTransform } from './lib/class-optimization-transform';
import {rollup} from 'rollup';
import sourceResolver from './lib/rollup-plugin-source-resolver';
import templateParser from './lib/rollup-plugin-template-parser';

const BASE_CONFIG = {
    babelConfig: { babelrc: false },
    sharedMetadata: {}
};

const plugins = [
    sourceResolver,
    templateParser,
    classTransformer,
    [flowPlugin, { checkPragma: false }],
];

export function compile(config, options = {}) {
    let componentPath = config.componentPath;
    let entry = config.entry;

    options = Object.assign({}, BASE_CONFIG, options);

    if (componentPath) {
        entry = normalizeEntryPath(componentPath);
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
            resolve({ code: result.code });
        })
        .catch((err) => {
            reject(err);
        });
    });
}