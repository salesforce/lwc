export default function ({ types: t }) {
    function addClassStaticMember(className, prop, blockStatement) {
        return t.expressionStatement(
            t.assignmentExpression(
                '=',
                t.memberExpression(t.identifier(className), t.identifier(prop)),
                blockStatement
            )
        );
    }

    return {
        name: "optimize-transform", // not required
        visitor: {
            Program(path, state) {
                const body = path.node.body;
                const exportDeclaration = body.pop();

                if (!t.isExportDeclaration(exportDeclaration)) {
                    throw new Error();
                }

                const templateProps = state.opts.templateProps || {};
                const className = exportDeclaration.declaration.name;
                body.push(addClassStaticMember(className, '$t$', t.valueToNode(templateProps)));
                body.push(exportDeclaration);
            }
        }
    };
}