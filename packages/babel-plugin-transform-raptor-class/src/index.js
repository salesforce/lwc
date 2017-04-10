/* eslint-env node */
const pathLib = require('path');

const PUBLIC_METHOD_DECORATOR = 'method';
const KEY_PROPS = 'publicProps';
const KEY_METHODS = 'publicMethods';
const KEY_RENDER = 'render';

module.exports = function (babel) {
    'use strict';
    const t = babel.types;

    return {
        name: 'raptor-class-transform',
        pre(file) {
            file.metadata.classDependencies = [];
        },
        visitor: {
            Program: {
                enter(path, state) {
                    const body = path.node.body;
                    const defaultExport = body.find(n => t.isExportDefaultDeclaration(n));
                    const declaration = defaultExport && defaultExport.declaration;
                    const isNamedClass = declaration && t.isClassDeclaration(declaration) && declaration.id;

                    // If there is not default class export no transformation will happen
                    if (!isNamedClass) {
                        path.stop();
                        return;
                    }
                    state.opts.className = declaration.id.name;
                    state.opts.componentNamespace = state.opts.componentNamespace;
                }
            },
            ClassDeclaration(path, state) {
                const className = path.get('id.name').node;
                const extraBody = transformClassBody.call(this, className, path.get('body'), state);
                path.getStatementParent().insertAfter(extraBody);
            },
            ImportDeclaration(path, state) {
                path.skip(); // Skip traversing children
                const dep = path.node.source.value;
                if (dep[0] !== '.') { // Filter relative paths
                    state.file.metadata.classDependencies.push(dep);
                }
            }
        }
    };

    function addClassStaticMember(className, prop, blockStatement) {
        return t.expressionStatement(
            t.assignmentExpression(
                '=',
                t.memberExpression(t.identifier(className), t.identifier(prop)),
                blockStatement
            )
        );
    }

    function injectRenderer(className, path, state) {
        const classPath = state.opts.componentName || state.file.opts.filename;
        const cmpName = pathLib.basename(classPath, '.js');
        const name = './' + cmpName + '.html';
        const id = state.file.addImport(name, 'default', 'tmpl');

        path.pushContainer('body', t.classMethod(
            'method',
            t.identifier(KEY_RENDER), [],
            t.blockStatement([t.returnStatement(id)])
        ));
    }

    function transformClassBody(className, path, state) {
        const classBody = path.get('body');
        const publicProps = [];
        const publicMethods = [];
        const extraBody = [];
        const keys = { [KEY_PROPS]: false, [KEY_METHODS]: false };

        for (let prop of classBody) {
            let key = prop.node.key.name;

            // Properties
            if (prop.isClassProperty()) {

                // Non-static props
                if (!prop.node.static) {
                    // Throw if we find `this`. (needs refinement)
                    prop.traverse({
                        ThisExpression() {
                            throw new Error('Reference to the instance is now allowed in class properties');
                        }
                    });

                    // Tranform to publicProps
                    let value = prop.node.value || t.numericLiteral(1);
                    if (!t.isLiteral(value) && !t.isIdentifier(value)) {
                        value = t.functionExpression(null, [], t.blockStatement([t.returnStatement(value)]));
                    }
                    publicProps.push(t.objectProperty(t.identifier(prop.node.key.name), value));

                    // Static props
                } else {
                    if (key in keys) {
                        keys[key] = true;
                    }
                    extraBody.push(addClassStaticMember(className, key, prop.node.value));
                    prop.remove();
                }

                // Methods
            } else if (prop.isClassMethod({
                    kind: 'method'
                })) {
                // Push to publich method
                if (prop.node.decorators && prop.node.decorators[0].expression.name === PUBLIC_METHOD_DECORATOR) {
                    publicMethods.push(key);
                }

                // If it has a render method later we won't do the transform
                if (key === KEY_RENDER && !prop.node.static) {
                    keys[key] = true;
                }
            }

            // Remove all decorators
            if (prop.node) {
                prop.node.decorators = null;
            }

        }

        if (!keys[KEY_PROPS] && publicProps.length) {
            extraBody.push(addClassStaticMember(className, KEY_PROPS, t.objectExpression(publicProps)));
        }

        if (!keys[KEY_METHODS] && publicMethods.length) {
            extraBody.push(addClassStaticMember(className, KEY_METHODS, t.valueToNode(publicMethods)));
        }

        if (!keys[KEY_RENDER]) {
            injectRenderer(className, path, state);
        }

        return extraBody;
    }
}
