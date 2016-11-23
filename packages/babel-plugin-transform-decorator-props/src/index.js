const KEY_PROPS = 'props';
const KEY_METHODS = 'methods';
const DECORATOR_PROP = 'prop';

module.exports = function ({ types: t }) {
    function addTypesStaticGetter(name, blockStatement) {
        return t.classMethod(
            'get',
            t.identifier(name), [],
            t.blockStatement([t.returnStatement(blockStatement)]),
            false,
            true
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

                    if (prop.node.decorators) {
                        const value = prop.get('value');
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
                }

                if (prop.isClassMethod({ kind: 'method' }) && prop.node.decorators) {
                    publicMethods.push(t.objectProperty(t.identifier(prop.node.key.name), t.numericLiteral(1)));
                    prop.node.decorators = null;
                }
            }
			if (publicProps.length) {
	            path.pushContainer('body', addTypesStaticGetter('props', t.objectExpression(publicProps)));
            }

            if (publicMethods.length) {
	            path.pushContainer('body', addTypesStaticGetter('methods', t.objectExpression(publicMethods)));
            }
            path.stop();
        }
    };

    return {
        visitor: {
            // Only transform the main class
            ExportDefaultDeclaration(path, state) {
                path.traverse(ASTClassVisitor, state);
            }
        }
    };
}