const PUBLIC_METHOD_DECORATOR = 'method';
const UNKNOWN_NAMESPACE = 'unknown';

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
                // Remove decorators for now.
                if (prop.node.decorators) {
                    prop.node.decorators = null;
                }
                // Throw if we find `this` (needs refinement)
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

            } else if (prop.isClassMethod({ kind: 'method' }) && prop.node.decorators) {
                if (prop.node.decorators[0].expression.name === PUBLIC_METHOD_DECORATOR) {
                    publicMethods.push(prop.node.key.name);
                }

                prop.node.decorators = null;
            }
        }
		console.log(this.entryClass);
        const prefix = this.entryClass !== className ? 'private-' : '';
        const tagName = (`${state.opts.cmpNamespace}-${prefix}${className}`).toLowerCase();

        extraBody.push(addClassStaticMember(className, 'tagName', t.stringLiteral(tagName)));

        if (publicProps.length) {
            extraBody.push(addClassStaticMember(className, 'publicProps', t.objectExpression(publicProps)));
        }

        if (publicMethods.length) {
            extraBody.push(addClassStaticMember(className, 'publicMethods', t.valueToNode(publicMethods)));
        }

        return extraBody;
    }

    return {
        pre() {
            this.compiledClass = {};
            this.entryClass = null;
        },
        visitor: {
            Program: {
                enter (path, state) {
                    const body = path.node.body;
                    const exportD = body.find(n => t.isExportDefaultDeclaration(n));
                    if (!exportD) {
                        throw Error('No default exports');
                    }

                    if (!state.opts.componentName) {
                        const decl = exportD.declaration;
                        const className = t.isClassDeclaration(decl) ? decl.id.name : decl.name;
                        state.opts.componentName = className.toLowerCase();
                    }

                    state.opts.componentNamespace = state.opts.componentNamespace || UNKNOWN_NAMESPACE;

                    console.log('>> ', state.opts);
                },
                exit (path) {
                    if (!this.entryClass) {
                        throw path.buildCodeFrameError("Error locating entry point class");
                    }
                }

            },
            ClassDeclaration(path, state) {
                const className = path.node.id.name;
                if (!className) {
                    throw path.buildCodeFrameError("For debugability purposes we don't allow anonymous classes");
                }

                this.compiledClass[className] = true;
                if (className.toLowerCase() === state.opts.cmpName) {
                    this.entryClass = className;
                }

                const extraBody = transformClassBody.call(this, className, path.get('body'), state);
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