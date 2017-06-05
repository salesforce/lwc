/* eslint-env node */
const pathLib = require('path');

const API_DECORATOR = 'api';
const KEY_PROPS = 'publicProps';
const KEY_METHODS = 'publicMethods';
const KEY_RENDER = 'render';
const KEY_LABELS = 'labels';
const KEY_MISSPELLED_METHODS = {
    'renderCallback': 'renderedCallback',
    'connectCallback': 'connectedCallback',
    'disconnectCallback': 'disconnectedCallback'
}

module.exports = function (babel) {
    'use strict';
    const t = babel.types;

    return {
        name: 'raptor-class-transform',
        pre(file) {
            file.metadata.classDependencies = [];
            file.metadata.labels = [];
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

    function extractApiPublicDecorator(key, node, list) {
        if (node.decorators && node.decorators.length) {
            const apiIndex = node.decorators.findIndex(i => i.expression.name === API_DECORATOR);
            if (apiIndex !== -1) {
                if (list) {
                    list.push(key);
                }
                node.decorators.splice(apiIndex, 1);
            }
        }
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
        const knownStaticKeys = { [KEY_PROPS]: false, [KEY_METHODS]: false };
        const labels = state.file.metadata.labels;

        for (let prop of classBody) {
            let key = prop.node.key.name;

            // Properties
            if (prop.isClassProperty()) {

                // Non-static props
                if (!prop.node.static) {
                    // Throw if we find `this`. (needs refinement)
                    prop.traverse({
                        ThisExpression() {
                            throw new Error('Reference to the instance is not allowed in class properties');
                        }
                    });

                    // Blacklist state from pulicProps
                    if (prop.node.key.name !== 'state') {
                        extractApiPublicDecorator(key, prop.node);
                        publicProps.push(t.objectProperty(t.identifier(prop.node.key.name), t.numericLiteral(1)));
                    }

                    // Static props
                } else {
                    // Flag that public static props are already define
                    if (key in knownStaticKeys) {
                        knownStaticKeys[key] = true;
                    }

                    // This is a temporal workaround to prefetch labels until we implement i18n properly
                    // https://git.soma.salesforce.com/raptor/raptor/issues/196
                    if (key === KEY_LABELS && prop.node.value.elements) {
                        labels.push.apply(labels, prop.node.value.elements.map(m => m.value));
                    } else {
                        extraBody.push(addClassStaticMember(className, key, prop.node.value));
                    }
                    prop.remove();
                }

                // Methods
            } else if (prop.isClassMethod({ kind: 'method' })) {
                // Push to public method
                extractApiPublicDecorator(key, prop.node, publicMethods);

                if (key in KEY_MISSPELLED_METHODS) {
                    throw path.buildCodeFrameError(`Wrong lifecycle method name ${key}. You probably meant ${KEY_MISSPELLED_METHODS[key]}`);
                }

                // If it has a render method later we won't do the transform
                if (key === KEY_RENDER && !prop.node.static) {
                    knownStaticKeys[key] = true;
                }
            }

        }

        if (!knownStaticKeys[KEY_PROPS] && publicProps.length) {
            extraBody.push(addClassStaticMember(className, KEY_PROPS, t.objectExpression(publicProps)));
        }

        if (!knownStaticKeys[KEY_METHODS] && publicMethods.length) {
            extraBody.push(addClassStaticMember(className, KEY_METHODS, t.valueToNode(publicMethods)));
        }

        if (!knownStaticKeys[KEY_RENDER]) {
            injectRenderer(className, path, state);
        }

        return extraBody;
    }
}
