export default function ({ types: t }) {
    const ASTClassVisitor = {
        ClassDeclaration(path) {
            const classBody = path.get('body').node.body;
            const {methodName, methodProps, methodAST } = this;

            // If there
            if (classBody.find((nodepath) => t.isClassMethod(nodepath) && nodepath.key.name === methodName)) {
                throw new Error ('We do not allow a render method for now!');
            }

            classBody.push(t.classMethod(
                'method',
                t.identifier(methodName),
                [t.objectPattern([
                    t.objectProperty(t.identifier('h'), t.identifier('h'), false, true),
                    t.objectProperty(t.identifier('i'), t.identifier('i'), false, true),
                    t.objectProperty(t.identifier('m'), t.identifier('m'), false, true),
                    t.objectProperty(t.identifier('v'), t.identifier('v'), false, true),

                ])],
                t.blockStatement([
                    t.returnStatement(methodAST)
                ])
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