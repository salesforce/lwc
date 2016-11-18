import {rollup} from 'rollup';
import injectRenderer from './lib/rollup-plugin-inject-renderer';
import sourceResolver from './lib/rollup-plugin-source-resolver';
import templateParser from './lib/rollup-plugin-template-parser';
import { extname, normalize, join, sep } from 'path';

const BASE_CONFIG = {
    babelrc: false
};

const plugins = [
    sourceResolver(BASE_CONFIG),
    templateParser(BASE_CONFIG),
    injectRenderer(BASE_CONFIG)
];



export function compile (config, options) {
    let componentPath = config.componentPath;
    let entry = config.entry;
    if (componentPath) {
        componentPath = normalize(config.componentPath.replace(/\/$/, ''));
        entry = extname(componentPath) === '.js' ? componentPath : join(componentPath, componentPath.split(sep).pop() + '.js' );  
    }

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

}