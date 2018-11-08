/*
 * After all our decorator transforms have run,
 * we have created static properties attached to the class body
 * Foo.track = {...}
 *
 */

const { basename } = require('path');
const moduleImports = require("@babel/helper-module-imports");
const { LWCClassErrors } = require('lwc-errors');
const { isLWCNode, generateError } = require("./utils");

const REGISTER_DECORATORS_ID = "registerDecorators";
const REGISTER_COMPONENT_ID = "registerComponent";

function postProcess({ types: t }) {
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

    function createRegisterComponent(path, state) {
        const id = moduleImports.addNamed(path, REGISTER_COMPONENT_ID, 'lwc');
        const { node } = path;
        if (path.isClassDeclaration()) {
            node.type = 'ClassExpression';
        }

        const templateIdentifier = importDefaultTemplate(path, state);

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

// -- Validation --------

function validateNoHTMLImports(importDeclarationPath) {
    const { node: { source : { value } } } = importDeclarationPath;
    if (value.endsWith('.html')) {
        throw generateError(importDeclarationPath, {
            errorInfo: LWCClassErrors.INVALID_HTML_IMPORT_IMPLICIT_MODE,
            messageArgs: [value]
        });
    }
}

function validateImplicitImport(programPath) {
    const body = programPath.get("body");
    for (const decl of body) {
        if (decl.isImportDeclaration()) {
            validateNoHTMLImports(decl);
        }
    }
}

function validateExplicitImport(path) {
    // WIP
}

module.exports = {
    postProcess,
    validateImplicitImport,
    validateExplicitImport
}
