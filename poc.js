const babel = require('babel-core');
const classPlugin = require('./packages/babel-plugin-transform-raptor-class');

const src = `var def = class {
    x = 1;
    y = 2;
}`;

babel.transform(src, { babelrc: false, plugins : [ classPlugin ] });