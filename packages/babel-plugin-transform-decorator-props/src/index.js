module.exports = function ({ types: t }) {
    function addTypesStaticGetter(blockStatement) {
        return t.classMethod(
            'get',
            t.identifier('props'), [],
            t.blockStatement([t.returnStatement(blockStatement)]),
            false,
            true
        );
    }

    const ASTClassVisitor = {
        ClassBody(path) {
            const classBody = path.get('body');
            const propDefs = {};
            let propertyDefs;

            for (let prop of classBody) {
                // Type definition
                if (prop.node.key.name === 'props' && prop.isClassMethod({ kind: 'get', static: true})) {
                    propertyDefs = prop;
                    break;

                    // Decorators
                } else if (prop.isClassProperty() && prop.node.decorators.length) {
                    const attrTypeDef = {};
                    const propDecorators = prop.node.decorators;

                    propDecorators.reduce((r, d) => {
                        if (t.isIdentifier(d.expression) && d.expression.name !== 'prop') {
                            attrTypeDef[d.expression.name] = true;
                        }
                        return r;
                    }, propDefs);

                    propDefs[prop.node.key.name] = Object.keys(attrTypeDef).length ? attrTypeDef : true;
                    prop.remove();
                }
            }

            if (propertyDefs) {
                return;
            }

            path.pushContainer('body', addTypesStaticGetter(t.valueToNode(propDefs)));
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