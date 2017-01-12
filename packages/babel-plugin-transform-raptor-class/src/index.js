const PUBLIC_METHOD_DECORATOR = 'method';
const UNKNOWN_NAMESPACE = 'unknown';
const KEY_PROPS = 'publicProps';
const KEY_METHODS = 'publicMethods';
const KEY_TAG = 'tagName';

module.exports = function (babel) {
    'use strict';
    const t = babel.types;

    function addClassStaticMember(className, prop, blockStatement) {
        return t.expressionStatement(
            t.assignmentExpression(
                '=',
                t.memberExpression(t.identifier(className), t.identifier(prop)),
                blockStatement
            )
        );
    }

    function transformClassBody(className, path, state) {
        const classBody = path.get('body');
        const publicProps = [];
        const publicMethods = [];
        const extraBody = [];

        for (let prop of classBody) {
            // Props
            if (prop.isClassProperty()) {
                // Remove decorators for now
                if (prop.node.decorators) {
                    prop.node.decorators = null;
                }
                // Throw if we find `this`. (needs refinement)
                prop.traverse({
                    ThisExpression() {
                        throw new Error('Reference to the instance is now allowed in class properties');
                    }
                });

                let value = prop.node.value || t.nullLiteral();
                if (!t.isLiteral(value) && !t.isIdentifier(value)) {
                    value = t.functionExpression(null, [], t.blockStatement([t.returnStatement(value)]));
                }

                publicProps.push(t.objectProperty(t.identifier(prop.node.key.name), value));
                prop.remove();

            } else if (prop.isClassMethod({
                    kind: 'method'
                }) && prop.node.decorators) {
                if (prop.node.decorators[0].expression.name === PUBLIC_METHOD_DECORATOR) {
                    publicMethods.push(prop.node.key.name);
                }

                prop.node.decorators = null;
            }
        }

        const tagName = (`${state.opts.componentNamespace}-${className}`).toLowerCase();

        extraBody.push(addClassStaticMember(className, KEY_TAG, t.stringLiteral(tagName)));

        if (publicProps.length) {
            extraBody.push(addClassStaticMember(className, KEY_PROPS, t.objectExpression(publicProps)));
        }

        if (publicMethods.length) {
            extraBody.push(addClassStaticMember(className, KEY_METHODS, t.valueToNode(publicMethods)));
        }

        return extraBody;
    }

    return {
        name: 'raptor-class-transform',
        visitor: {
            Program(path, state) {
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
                state.opts.componentNamespace = state.opts.componentNamespace || UNKNOWN_NAMESPACE;
            },
            ClassDeclaration(path, state) {
                const className = path.get('id.name').node;
                const extraBody = transformClassBody.call(this, className, path.get('body'), state);

                if (state.opts.componentName && state.opts.componentName.toLowerCase() !== className.toLowerCase()) {
                    throw path.buildCodeFrameError("For a component bundle, the className must match the folder name");
                }

                if (path.inList) {
                    path.insertAfter(extraBody);
                } else {
                    const root = path.findParent((p) => p.isProgram());
                    root.pushContainer('body', extraBody);
                }
            }
        }
    };
}