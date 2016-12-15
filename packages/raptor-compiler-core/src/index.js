import {rollup} from 'rollup';
import {normalizeEntryPath} from './lib/utils';
import sourceResolver from './lib/rollup-plugin-source-resolver';
import templateParser from './lib/rollup-plugin-template-parser';
import transformClass from './lib/rollup-plugin-transform-class';
import removeAnnotations from './lib/rollup-plugin-remove-annotations';

const BASE_OPTIONS = {
    babelConfig: { 
        babelrc: false,
        sourceMaps: true 
    }
};

export function compile(config, options) {
    options = options || {};
    const componentPath = config.componentPath;
    let entry = config.entry;

    options = Object.assign({}, BASE_OPTIONS, options);

    const plugins = [
        [sourceResolver, config],
        templateParser,
        [transformClass, config],
        removeAnnotations
    ];

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
                    let plugin = pluginConfig[0];
                    let pluginOptions = pluginConfig[1];
                    pluginOptions = Object.assign({}, BASE_OPTIONS, pluginOptions);
                    return plugin(pluginOptions);
                }

                return pluginConfig(BASE_OPTIONS);
                
            })
        })
        .then((bundle) => {
            resolve(bundle.generate());
        })
        .catch((err) => {
            reject(err);
        });
    });
}

export const version = "@";