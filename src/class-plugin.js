export default function ({ types: t }) {
    const RENDER_METHOD = 'render';

    const ASTClassVisitor = {
        ClassDeclaration(path) {
            const classBody = path.get('body').node.body;
            // If there
            if (classBody.find((nodepath) => t.isClassMethod(nodepath) && nodepath.key.name === RENDER_METHOD)) {
                throw new Error ('We do not allow a render method for now!');
            }

            classBody.push(t.classMethod(
                'method',
                t.identifier(RENDER_METHOD), 
                [/*arguments*/],
                t.blockStatement([
                    t.expressionStatement(
                        t.valueToNode('TODO!')
                    )
                ])
            ));

            path.stop();
        }
    };
    
    return {
        visitor: {
            ExportDefaultDeclaration(path) {
                // We do a traversal here because due to babel plugin ordering, 
                // We need to guarantee we find the Class declaration before gets transformed by other plugin
                // See https://github.com/babel/notes/blob/master/2016-08/august-01.md#potential-api-changes-for-traversal 
                path.traverse(ASTClassVisitor);
            }
        }
    };      
}