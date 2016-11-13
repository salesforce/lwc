import * as fs from 'fs';

import classPlugin from './class-plugin';
import {compile as compileTemplate} from 'raptor-template-compiler';
import {transform} from 'babel-core';

export function compile(config, options = {}) {
// WIP!
}

export function compileComponent(cmpPath, options = {}) {
// WIP!
}

const BASE_CONFIG = {
    presets: [
        //'es2015'
    ],
    plugins: [
        'transform-runtime',
        'transform-decorators-legacy',
        'transform-class-properties'
    ]
};
export function compileClass(src, options = {}) {
    const config = {
        babelrc: false,
        presets: BASE_CONFIG.presets,
        plugins: [
            [classPlugin, {}],
            ...BASE_CONFIG.plugins,
        ]
    };

    return transform(src, config);
}

export function compileClassFromFile(classPath, options = {}) {
    const src = fs.readFileSync(classPath).toString();
    return compileClass(src, options);
}

export function compileTemplateFromFile(templatePath, options = {}) {
    const src = fs.readFileSync(templatePath).toString();
    const result = compileTemplate(src);
    return result;
}

export { compileTemplate };

// -- DELETE ME ----
export function test() {
    const { code: codeTemplate } = compileTemplateFromFile('test/fixtures/classAndtemplate/classAndTemplate.html');
    console.log('Template code: \n ', codeTemplate);
    // const { code: codeClass } = compileClassFromFile('test/fixtures/classAndtemplate/classAndTemplate.js');
    // console.log(codeClass); 
}