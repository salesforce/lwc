import * as babelTypes from 'babel-types';
import * as fs from 'fs';
import * as path from 'path';

import classPlugin from 'babel-plugin-transform-add-class-method';
import {compile as compileTemplate} from 'raptor-template-compiler';
import {transform} from 'babel-core';

const BASE_CONFIG = {
    presets: [
        //'es2015'
    ],
    plugins: [
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

export { compileTemplate };

export function compile(config) {
    const componentPath = config.componentPath;
    const opts = {};
    let templateSrc = config.templateSrc;
    let classSrc = config.classSrc;

    if (componentPath) {
        const cmpPath = path.normalize(componentPath).replace(/\/$/, '');
        const parts = cmpPath.split(path.sep);
        const name = parts.pop(); 
        const templatePath = path.join(cmpPath, path.sep, name + '.html');
        const classPath = path.join(cmpPath, path.sep, name + '.js');

        templateSrc = fs.readFileSync(templatePath).toString();
        classSrc = fs.readFileSync(classPath).toString();
    }

    if (templateSrc) {
        const templateResult = compileTemplate(templateSrc);
        opts.templateAST = templateResult.ast.program.body[0].expression;
    }

    const compiled = compileClass(classSrc, opts);
    console.log(compiled.code);

    return compiled;
}

// -- DELETE ME --------------------------------------------------------------------
export function test() {
    compile({ componentPath: 'test/fixtures/classAndtemplate/' });
}