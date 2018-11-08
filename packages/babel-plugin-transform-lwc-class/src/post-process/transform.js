/*
 * After all our decorator transforms have run,
 * we have created static properties attached to the class body
 * Foo.track = {...}
 *
 */

const { basename } = require('path');
const moduleImports = require("@babel/helper-module-imports");
const { isLWCNode } = require("../utils");

const REGISTER_DECORATORS_ID = "registerDecorators";
const REGISTER_COMPONENT_ID = "registerComponent";

module.exports = function postProcess({ types: t }) {
    function collectDecoratedProperties(body) {
        const metaPropertyList = [];
        for (const classProps of body.get("body")) {
            if (classProps.isClassProperty({
                    static: true
                })) {
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

    function createRegisterDecoratorsCall(path, klass, props) {
        const id = moduleImports.addNamed(path, REGISTER_DECORATORS_ID, 'lwc');

        return t.callExpression(id, [
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
        return moduleImports.addDefault(path, `./${componentName}.html`, {
            nameHint: 'tmpl'
        });
    }

    function createRegisterComponent(declarationPath, state) {
        const id = moduleImports.addNamed(declarationPath, REGISTER_COMPONENT_ID, 'lwc');
        const templateIdentifier = importDefaultTemplate(declarationPath, state);
        const statementPath = declarationPath.getStatementParent();
        const hasIdentifier = t.isIdentifier(declarationPath.node.id);
        let node = declarationPath.node;

        if (hasIdentifier) {
            statementPath.insertBefore(declarationPath.node);
            node = node.id;
        } else {
            // if it does not have an id, we can treat it as a ClassExpression
            node.type = "ClassExpression";
        }

        return t.callExpression(
            id,
            [node, t.objectExpression([
                t.objectProperty(t.identifier('tmpl'), templateIdentifier)
            ])]
        );
    }

    function needsComponentRegistration(node) {
        return t.isIdentifier(node) || t.isCallExpression(node) || t.isClassDeclaration(node);
    }

    return {
        /// Register component
        ExportDefaultDeclaration(path, state) {
            const implicitResolution = !state.opts.isExplicitImport;
            if (implicitResolution) {
                const declaration = path.get("declaration");
                if (needsComponentRegistration(declaration.node)) {
                    declaration.replaceWith(
                        createRegisterComponent(declaration, state)
                    );
                }
            }
        },
        // Decorator collector for class expressions
        ClassExpression(path) {
            const { node } = path;
            const body = path.get("body");
            const metaPropertyList = collectDecoratedProperties(body);
            if (metaPropertyList.length) {
                path.replaceWith(createRegisterDecoratorsCall(path, node, metaPropertyList));
                path.skip(); // reusing node so we need to skip it
            }
        },
        // Decorator collector for class declarations
        ClassDeclaration(path) {
            const { node } = path;
            const body = path.get("body");
            const metaPropertyList = collectDecoratedProperties(body);

            if (metaPropertyList.length) {
                const statementPath = path.getStatementParent();
                const hasIdentifier = t.isIdentifier(node.id);

                if (hasIdentifier) {
                    statementPath.insertAfter(
                        createRegisterDecoratorsCall(path, node.id, metaPropertyList)
                    );
                } else {
                    // if it does not have an id, we can treat it as a ClassExpression
                    node.type = "ClassExpression";
                    path.replaceWith(
                        createRegisterDecoratorsCall(path, node, metaPropertyList)
                    );
                }
            }
        }
    };
};
