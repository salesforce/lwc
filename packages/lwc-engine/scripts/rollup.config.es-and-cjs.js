const path = require('path');
const typescript = require('rollup-plugin-typescript');
const { generateTargetName, ignoreCircularDependencies } = require('./engine.rollup.config.util');
const { version } = require('../package.json');

const entry = path.resolve(__dirname, '../src/framework/main.ts');
const commonJSDirectory = path.resolve(__dirname, '../dist/commonjs');
const modulesDirectory = path.resolve(__dirname, '../dist/modules');

const banner = (`/**\n * Copyright (C) 2017 salesforce.com, inc.\n */`);
const footer = `/** version: ${version} */`;

function rollupConfig(config) {
    const { format, target } = config;

    const targetName = generateTargetName(config);
    const targetDirectory = (format === 'es' ? modulesDirectory : commonJSDirectory) + `/${target}`;

     return {
        input: entry,
        onwarn: ignoreCircularDependencies,
        output: {
            name: "Engine",
            file: path.join(targetDirectory, targetName),
            format: format,
            banner: banner,
            footer: footer,
        },
        plugins: [ typescript({ target: target, typescript: require('typescript') }) ]
    }
}

module.exports = [
    rollupConfig({ format:'es', target:'es2017' }),
    rollupConfig({ format:'cjs', target:'es2017' }),
    rollupConfig({ format: 'cjs', target: 'es5' }),
];
