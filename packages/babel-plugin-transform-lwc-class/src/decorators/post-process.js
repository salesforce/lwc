/*
* After all our decorator transforms have run,
* we have created static properties attached to the class body
* Foo.track = {...}
*
*/

const { basename } = require('path');
const { isLWCNode } = require("../utils");
const REGISTER_DECORATORS_ID = "registerDecorators";
const moduleImports = require("@babel/helper-module-imports");

module.exports = function postDecorators({ types: t }) {
    function collectDecoratedProperties(body) {
        const metaPropertyList = [];
        for (const classProps of body.get("body")) {
            if (classProps.isClassProperty({ static: true })) {
                const propertyNode = classProps.node;
                if (isLWCNode(propertyNode)) {
                    metaPropertyList.push(
                        t.objectProperty(propertyNode.key, propertyNode.value)
                    );
                    classProps.remove();
                }
            }
        }
        return metaPropertyList;
    }

    function createRegisterCall(klass, props) {
        return t.callExpression(t.identifier(REGISTER_DECORATORS_ID), [
            klass,
            t.objectExpression(props)
        ]);
    }

    function getBaseName({ file }) {
        const classPath = file.opts.filename;
        return basename(classPath, '.js');
    }

    function importDefaultTemplate(path, state) {
        const componentName = getBaseName(state);
        return moduleImports.addDefault(path, `./${componentName}.html`, { nameHint: 'tmpl' });
    }

    function createRegisterComponent(path, state) {
        const { node } = path;
        if (path.isClassDeclaration()) {
            node.type = 'ClassExpression';
        }

        const templateIdentifier = importDefaultTemplate(path, state);

        return t.callExpression(
          t.identifier('registerComponent'),
          [node, t.objectExpression([
              t.objectProperty(t.identifier('tmpl'), templateIdentifier)
          ])]
        );
      }

      function needsComponentRegistration(node) {
        return t.isIdentifier(node)|| t.isCallExpression(node) || t.isClassDeclaration(node);
      }

    return {
        ExportDefaultDeclaration(path, state) {
            const implicitResolution  = !state.opts.isExplicitImport;
            if (implicitResolution) {
                const declaration = path.get("declaration");
                if (needsComponentRegistration(declaration.node)) {
                    declaration.replaceWith(
                        createRegisterComponent(declaration, state)
                    );
                }
            }
        },
        ClassExpression(path) {
            const { node } = path;
            const body = path.get("body");
            const metaPropertyList = collectDecoratedProperties(body);
            if (metaPropertyList.length) {
                path.replaceWith(createRegisterCall(node, metaPropertyList));
                path.skip(); // reusing node so we need to skip it
            }
        },
        ClassDeclaration(path) {
            const { node } = path;
            const body = path.get("body");
            const metaPropertyList = collectDecoratedProperties(body);

            if (metaPropertyList.length) {
                const statementPath = path.getStatementParent();
                const hasIdentifier = t.isIdentifier(node.id);

                if (hasIdentifier) {
                    statementPath.insertAfter(
                        createRegisterCall(id, metaPropertyList)
                    );
                } else {
                    // if it does not have an id, we can treat it as a ClassExpression
                    node.type = "ClassExpression";
                    path.replaceWith(
                        createRegisterCall(node, metaPropertyList)
                    );
                }
            }
        }
    };
};
