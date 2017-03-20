/* eslint-env node */
const pathLib = require('path');

const PUBLIC_METHOD_DECORATOR = 'method';
const UNKNOWN_NAMESPACE = 'unknown';
const KEY_PROPS = 'publicProps';
const KEY_METHODS = 'publicMethods';
const KEY_TAG = 'tagName';
const KEY_RENDER = 'render';

module.exports = function (babel) {
    'use strict';
    const t = babel.types;

    return {
        name: 'raptor-class-transform',
        pre(file) {
            file.metadata.importRefs = Object.create(null);
            file.metadata.usedRefs = Object.create(null);
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
                },
                exit(path, state) {
                    state.file.metadata.classDependencies = Object.keys(state.file.metadata.usedRefs);
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
                    path.node.specifiers.forEach(s => {
                        state.file.metadata.importRefs[s.local.name] = dep;
                    });
                }
            },
            Identifier(path, state) {
                const name = path.node.name;
                const ref = state.file.metadata.importRefs[name];
                if (ref && !path.scope.hasOwnBinding(name)) {
                    state.file.metadata.usedRefs[ref] = true;
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
        const templateProps = state.file.addImport(name, 'templateUsedIds', 't');

        path.pushContainer('body', t.classMethod(
            'method',
            t.identifier(KEY_RENDER), [],
            t.blockStatement([t.returnStatement(id)])
        ));

        return addClassStaticMember(className, 'templateUsedIds', templateProps);
    }

    function transformClassBody(className, path, state) {
        const classBody = path.get('body');
        const publicProps = [];
        const publicMethods = [];
        const extraBody = [];
        const keys = {
            [KEY_PROPS]: false,
            [KEY_METHODS]: false,
            [KEY_TAG]: false,
        };

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
                    let value = prop.node.value || t.nullLiteral();
                    if (!t.isLiteral(value) && !t.isIdentifier(value)) {
                        value = t.functionExpression(null, [], t.blockStatement([t.returnStatement(value)]));
                    }
                    publicProps.push(t.objectProperty(t.identifier(prop.node.key.name), value));
                    prop.remove();

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

        if (!keys[KEY_TAG]) {
            const componentName = state.opts.componentName || className;
            const componentNs = state.opts.componentNamespace;
            const ns = componentNs ? componentNs : componentName.indexOf('-') === -1 ? UNKNOWN_NAMESPACE : '';
            const tagName = ns ? (`${ns}-${componentName}`).toLowerCase() : componentName;

            extraBody.push(addClassStaticMember(className, KEY_TAG, t.stringLiteral(tagName)));
        }

        if (!keys[KEY_PROPS] && publicProps.length) {
            extraBody.push(addClassStaticMember(className, KEY_PROPS, t.objectExpression(publicProps)));
        }

        if (!keys[KEY_METHODS] && publicMethods.length) {
            extraBody.push(addClassStaticMember(className, KEY_METHODS, t.valueToNode(publicMethods)));
        }

        if (!keys[KEY_RENDER]) {
            extraBody.push(injectRenderer(className, path, state));
        }

        return extraBody;
    }
}
