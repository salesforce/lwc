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
    
    function addUsedTemplateProps (path, templateProps) {
        const body = path.node.body;
        const exportDeclaration = body.pop();

        if (!t.isExportDeclaration(exportDeclaration)) {
            throw new Error();
        }

        body.push(addClassStaticMember(exportDeclaration.declaration.name, 'templateBoundIdentifiers', t.valueToNode(templateProps)));
        body.push(exportDeclaration);
    }

    return {
        name: "optimize-transform", // not required
        visitor: {
            Program(path, state) {
                const templateProps = state.opts.templateProps || {};
                addUsedTemplateProps(path, templateProps);
            }
        }
    };
}