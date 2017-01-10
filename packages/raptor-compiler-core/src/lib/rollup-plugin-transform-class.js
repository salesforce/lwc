import babelDecoratorProps from 'babel-plugin-transform-raptor-class';
import babelInjectPlugin from 'babel-plugin-transform-raptor-renderer';
import { transform } from 'babel-core';
import { dirname } from 'path';

function getQualifiedName(options) {
    let componentPath = options.componentPath;
    let componentName = options.componentName;
    let componentNamespace = options.componentNamespace;

    const dirParts = dirname(componentPath).split('/');
    const pathBasedName = dirParts.pop();
    let pathBasedNS = dirParts.pop();

    if (pathBasedNS === 'components') {
        pathBasedNS = dirParts.pop();
    }

    componentNamespace = componentNamespace || pathBasedNS.toLowerCase();
    componentName = componentName || pathBasedName.toLowerCase(); 

    return { componentName : componentName, componentNamespace : componentNamespace };
}

export default function (options) {
    options = options || {};
    const qualifiedName = getQualifiedName(options);
    const componentNamespace = qualifiedName.componentNamespace;
    const componentName = qualifiedName.componentName;

    const localBabelConfig = {
        babelrc: false,
        sourceMaps: true,
        plugins: [
            [babelDecoratorProps, { componentNamespace: componentNamespace, componentName : componentName }],
            babelInjectPlugin
        ],
        parserOpts: { plugins: ['*'] }
    };

    options = Object.assign({}, options.babelConfig || {}, localBabelConfig);

    return {
        name : 'transform-class',
        injected: false,
        transform (src, id) {
            //console.log('[]transform-class', '\t>> ' , id);
            if (!this.injected) {
                this.injected = true;
                const localOptions = Object.assign(options, { filename: id });
                const res = transform(src, localOptions);
                return { code: res.code, map: res.map };
            }            
        }
    };
}