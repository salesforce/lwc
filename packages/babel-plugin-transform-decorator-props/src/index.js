const KEY_PROPS = 'props';
const KEY_METHODS = 'methods';
const DECORATOR_PROP = 'prop';

module.exports = function ({ types: t }) {

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

                // Type definition
                if (prop.node.key.name === KEY_PROPS || prop.node.key.name === KEY_METHODS) {
                    throw new Error(prop.node.key.name + ' is a reserved key for static class properties');
                }

                // Props
                if (prop.isClassProperty()) {
                    // Decorators
                    if (!prop.node.decorators) {
                        throw new Error(`
                            Static non-public properties are not allowed. 
                            You can either make them the property public (using @prop decorator) 
                            or move it to the constructor.`);
                    }

                    prop.traverse({
                        ThisExpression() {
                            throw new Error('Reference to the instance is now allowed in class properties');
                        }
                    });
                    
                    const propDecorators = prop.node.decorators;

                    propDecorators.reduce((r, d) => {
                        if (t.isIdentifier(d.expression) && d.expression.name === DECORATOR_PROP) {
                            let value = prop.node.value || t.nullLiteral();
                            if (!t.isLiteral(value) && !t.isIdentifier(value)) {
                                value = t.functionExpression(null, [], t.blockStatement([t.returnStatement(value)]));
                            }
                            r.push(t.objectProperty(t.identifier(prop.node.key.name), value));
                        }
                        return r;
                    }, publicProps);

                    prop.remove();
                }

                if (prop.isClassMethod({kind: 'method'}) && prop.node.decorators) {
                    publicMethods.push(prop.node.key.name);
                    prop.node.decorators = null;
                }
            }

            const root = path.find((p) => p.isProgram());

            root.pushContainer('body', addClassStaticMember(state.opts.className, 'publicProps', t.objectExpression(publicProps)));
            root.pushContainer('body', addClassStaticMember(state.opts.className, 'publicMethods', t.valueToNode(publicMethods)));

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