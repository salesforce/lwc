import {rollup} from 'rollup';
import injectRenderer from './lib/rollup-plugin-inject-renderer';
import sourceResolver from './lib/rollup-plugin-source-resolver';
import templateParser from './lib/rollup-plugin-template-parser';
import {normalizeEntryPath} from './lib/utils';

const BASE_CONFIG = {
    babelrc: false
};

const plugins = [
    sourceResolver(BASE_CONFIG),
    templateParser(BASE_CONFIG),
    injectRenderer(BASE_CONFIG)
];

export function compile(config) {
    let componentPath = config.componentPath;
    let entry = config.entry;

    if (componentPath) {
        entry = normalizeEntryPath(componentPath);
    }
    return new Promise((resolve, reject) => {
        rollup({ entry, plugins })
        .then((bundle) => {
            resolve({ code: bundle.generate({}).code });
        })
        .catch((err) => {
            reject(err);
        });
    });
}