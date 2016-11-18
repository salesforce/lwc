import injectRenderer from './lib/rollup-plugin-inject-renderer';
import {rollup} from 'rollup';
import sourceResolver from './lib/rollup-plugin-source-resolver';
import templateParser from './lib/rollup-plugin-template-parser';

const BASE_CONFIG = {
    babelrc: false
};

const plugins = [
    sourceResolver(BASE_CONFIG),
    templateParser(BASE_CONFIG),
    injectRenderer(BASE_CONFIG)
];

const entry = 'test/fixtures/classAndTemplate/classAndTemplate.js';

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