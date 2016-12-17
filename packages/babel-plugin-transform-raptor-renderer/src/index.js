/* eslint-env node */
const pathLib = require('path');

const METHOD_NAME = 'render';
const METHOD_ARGUMENT_NAME = 'p';

module.exports = function (babel) {
    'use strict';
    const t = babel.types;

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
        ClassDeclaration (path, state) {
            let name = state.opts.name;

            if (!name) {
                const classPath = state.file.opts.filename;
                const cmpName = pathLib.basename(classPath, '.js');
                name = './' + cmpName + '.html';
            }

            const className = path.node.id.name;
            const id = state.file.addImport(name, 'default', 'tmpl');
            const classBody = path.get('body').node.body;

            if (classBody.find((nodepath) => t.isClassMethod(nodepath) && nodepath.key.name === METHOD_NAME)) {
                throw new Error('We do not allow a render method for now');
            }

            classBody.push(t.classMethod(
                'method',
                t.identifier(METHOD_NAME), [t.identifier(METHOD_ARGUMENT_NAME)],
                t.blockStatement([t.returnStatement(
                    t.callExpression(
                        t.memberExpression(id, t.identifier('call')), [t.thisExpression(), t.identifier(METHOD_ARGUMENT_NAME)]
                    )
                )])
            ));

            const templateProps = state.file.addImport(name, 'usedIdentifiers', 't');
            const root = path.find((p) => t.isProgram(p));
            root.pushContainer('body', addClassStaticMember(className, 'templateUsedProps', templateProps));

            path.stop();
        }
    };

    return {
        name: 'raptor-renderer',
        visitor: {
            ExportDefaultDeclaration(path, state) {
                path.traverse(ASTClassVisitor, state);
            }
        }
    };
};