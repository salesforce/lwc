const PUBLIC_METHOD_DECORATOR = 'method';

module.exports = function (babel) {
    'use strict';
    const t = babel.types;

    function generateClassName(path) {
        return path.scope.generateUidIdentifier("className");
    }

    function addClassStaticMember(className, prop, blockStatement) {
        return t.expressionStatement(
            t.assignmentExpression(
                '=',
                t.memberExpression(t.identifier(className), t.identifier(prop)),
                blockStatement
            )
        );
    }

    const ASTClassVisitor = {
        ClassBody(path, state) {
            const classBody = path.get('body');
            const publicProps = [];
            const publicMethods = [];

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

                } else if (prop.isClassMethod({
                        kind: 'method'
                    }) && prop.node.decorators) {
                    if (prop.node.decorators[0].expression.name === PUBLIC_METHOD_DECORATOR) {
                        publicMethods.push(prop.node.key.name);
                    }
                    prop.node.decorators = null;
                }
            }

            const containerNode = path.find((p) => p.isProgram());

            if (state.opts.namespace) {
                containerNode.pushContainer('body', addClassStaticMember(state.opts.className, 'ns', t.stringLiteral(state.opts.namespace)));
            }

            if (publicProps.length) {
                containerNode.pushContainer('body', addClassStaticMember(state.opts.className, 'publicProps', t.objectExpression(publicProps)));
            }

            if (publicMethods.length) {
                containerNode.pushContainer('body', addClassStaticMember(state.opts.className, 'publicMethods', t.valueToNode(publicMethods)));
            }

            path.stop();
        }
    };

    return {
        visitor: {
            Program(path, state) {
                const body = path.node.body;
                const exports = body.find(n => t.isExportDefaultDeclaration(n));
                if (!exports) {
                    throw Error('No default exports');
                }

                const decl = exports.declaration;
                const className = t.isClassDeclaration(decl) ? decl.id.name : decl.name;
                state.opts.className = className;
            },
            ClassDeclaration(path, state) {
                const classId = path.node.id.name;
                if (classId === state.opts.className) {
                    path.traverse(ASTClassVisitor, state);
                }
            }
        }
    };
}