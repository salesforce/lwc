export default function ({ types: t }) {
    const ASTClassVisitor = {
        ClassDeclaration(path) {
            const classBody = path.get('body').node.body;
            const {methodName, methodPropsAST, methodBodyAST } = this;

            // If there
            if (classBody.find((nodepath) => t.isClassMethod(nodepath) && nodepath.key.name === methodName)) {
                throw new Error ('We do not allow a render method for now!');
            }

            classBody.push(t.classMethod(
                'method',
                t.identifier(methodName),
                methodPropsAST,
                t.blockStatement([t.returnStatement(methodBodyAST)])
            ));

            path.stop();
        }
    };
    
    return {
        visitor: {
            ExportDefaultDeclaration(path, state) {
                if (!state.opts.methodName) {
                    return; 
                }
                // We do a traversal here because due to babel plugin ordering, 
                // We need to guarantee we find the Class declaration before gets transformed by other plugin
                // See https://github.com/babel/notes/blob/master/2016-08/august-01.md#potential-api-changes-for-traversal 
                path.traverse(ASTClassVisitor, state.opts);
            }
        }
    };      
}