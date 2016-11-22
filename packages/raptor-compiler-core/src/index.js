import flowPlugin from './lib/rollup-plugin-flow';
import injectRenderer from './lib/rollup-plugin-class-transformer';
import {normalizeEntryPath} from './lib/utils';
import {rollup} from 'rollup';
import sourceResolver from './lib/rollup-plugin-source-resolver';
import templateParser from './lib/rollup-plugin-template-parser';

const BASE_CONFIG = {
    babelrc: false
};

const plugins = [
    [flowPlugin, { checkPragma: false }],
    sourceResolver,
    templateParser,
    injectRenderer,
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
            resolve({ code: bundle.generate({}).code });
        })
        .catch((err) => {
            reject(err);
        });
    });
}