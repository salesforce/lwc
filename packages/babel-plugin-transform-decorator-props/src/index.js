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

            const root = path.find((p) => p.isProgram());

            if (publicProps.length) {
                root.pushContainer('body', addClassStaticMember(state.opts.className, 'publicProps', t.objectExpression(publicProps)));
            }

            if (publicMethods.length) {
                root.pushContainer('body', addClassStaticMember(state.opts.className, 'publicMethods', t.valueToNode(publicMethods)));
            }

            path.stop();
        }
    };

    return {
        visitor: {
            // Only transform the main class
            ExportDefaultDeclaration(path, state) {
                const exportDeclaration = path.get('declaration').node;
                let className = exportDeclaration.id && exportDeclaration.id.name;

                if (!className) {
                    const classNameId = generateClassName(path, state);
                    exportDeclaration.id = classNameId;
                    className = classNameId.name;
                }

                state.opts.className = className;
                path.traverse(ASTClassVisitor, state);
            }
        }
    };
}