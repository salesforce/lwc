const REGISTER_DECORATORS_ID = "registerDecorators";
const { isLWCNode } = require("../utils");
/*
* After all our decorator transforms have run,
* we have created static properties attached to the class body
* Foo.track = {...}
*
*/
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

    function createRegisterComponent(node) {
        return t.callExpression(
          t.identifier('registerComponent'),
          [node]
        );
      }

      function needsComponentRegistration(node) {
        return t.isIdentifier(node)|| t.isCallExpression(node) || t.isClassDeclaration(node);
      }

    return {
        ExportDefaultDeclaration(path) {
            const declaration = path.get("declaration");
            if (needsComponentRegistration(declaration.node)) {
                if (declaration.isClassDeclaration()) {
                  declaration.node.type = 'ClassExpression';
                }

                declaration.replaceWith(
                  createRegisterComponent(declaration.node)
                );
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
