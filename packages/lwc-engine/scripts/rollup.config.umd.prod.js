
const path = require('path');
const replace = require('rollup-plugin-replace');
const typescript = require('typescript');
const rollupTypescriptPlugin = require('rollup-plugin-typescript');
const rollupUglifyPlugin = require('rollup-plugin-uglify');
const { minify } = require('uglify-es');
const nodeResolve = require('rollup-plugin-node-resolve');

const { version } = require('../package.json');
const { generateTargetName, ignoreCircularDependencies } = require('./engine.rollup.config.util');

const entry = path.resolve(__dirname, '../src/framework/main.ts');
const outputDir = path.resolve(__dirname, '../dist/umd');
const banner = (`/**\n * Copyright (C) 2017 salesforce.com, inc.\n */`);
const footer = `/** version: ${version} */`;

function rollupConfig(config){
    const { format, target, prod } = config;
    let plugins = [
        nodeResolve(),
        rollupTypescriptPlugin({ typescript, target, module: 'es6', sourceMap: false }),
        replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
        prod && rollupUglifyPlugin({}, minify)
    ].filter(p => p);

    const targetName = generateTargetName(config);

    // sourceMap issue: https://github.com/mjeanroy/rollup-plugin-license/issues/6
    return {
        input: entry,
        output: {
            file: path.join(outputDir + `/${target}`,  targetName),
            format: format,
            name: "Engine",
            banner: banner,
            footer: footer,
        },
        onwarn: ignoreCircularDependencies,
        plugins
    }
}

module.exports = [
    // PROD
    rollupConfig({ format: 'umd', prod: true, target: 'es5' }),
    rollupConfig({ format: 'umd', prod: true, target: 'es2017' }),

    // PRODDEBUG mode
    rollupConfig({ format: 'umd', proddebug: true, target: 'es2017' }),
    rollupConfig({ format: 'umd', proddebug: true, target: 'es5' })
]

