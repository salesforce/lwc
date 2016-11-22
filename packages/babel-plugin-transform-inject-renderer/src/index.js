/* eslint-env node */
const pathLib = require('path');

const METHOD_NAME = 'render'; 
const METHOD_ARGUMENT_NAME = 'p';

module.exports = function ({ types: t }) {
    const ASTClassVisitor = {
        ClassDeclaration(path, state) {
            let name = state.opts.name;

            if (!name) {
                const classPath = state.file.opts.filename;
                const cmpName = pathLib.basename(classPath, '.js');
                name = './' + cmpName + '.html';
            }

            const id = state.file.addImport(name, 'default', 't');
            const classBody = path.get('body').node.body;

            if (classBody.find((nodepath) => t.isClassMethod(nodepath) && nodepath.key.name === METHOD_NAME)) {
                throw new Error ('We do not allow a render method for now!');
            }

            classBody.push(t.classMethod(
                'method',
                t.identifier(METHOD_NAME),
                [t.identifier(METHOD_ARGUMENT_NAME)],
                t.blockStatement([t.returnStatement(
                    t.callExpression(
                        t.memberExpression(id, t.identifier('call')), 
                        [t.thisExpression(), t.identifier(METHOD_ARGUMENT_NAME)]
                    )
                )])
            ));

            path.stop();
        }
    };

    return {
        visitor: {
            ExportDefaultDeclaration(path, state) {
                path.traverse(ASTClassVisitor, state);
            }
        }
    };
};
