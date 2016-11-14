import * as babelTypes from 'babel-types';
import * as fs from 'fs';

import classPlugin from 'babel-plugin-transform-add-class-method';
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

function generatePropsAST(t) {
    return [t.objectPattern(['h', 'i'].map((n) => t.objectProperty(t.identifier(n), t.identifier(n), false, true)))];
}

export function compileClass(src, options = {}) {
    const config = {
        babelrc: false,
        presets: BASE_CONFIG.presets,
        plugins: [
            [classPlugin, {
                methodName     : 'render',
                methodPropsAST : generatePropsAST(babelTypes),
                methodBodyAST  : options.templateAST
            }],
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
    const templateResult = compileTemplateFromFile('test/fixtures/classAndtemplate/classAndTemplate.html');
    const classResult = compileClassFromFile('test/fixtures/classAndtemplate/classAndTemplate.js', {
        templateAST: templateResult.ast.program.body[0].expression
    });

    console.log(classResult.code);
}