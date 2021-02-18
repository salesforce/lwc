/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { basename, extname } = require('path');

const moduleImports = require('@babel/helper-module-imports');
const { LWCClassErrors } = require('@lwc/errors');

const {
    LWC_PACKAGE_ALIAS,
    LWC_SUPPORTED_APIS,
    REGISTER_COMPONENT_ID,
    REGISTER_DECORATORS_ID,
    TEMPLATE_KEY,
} = require('./constants');
const { generateError, getEngineImportSpecifiers, isLWCNode } = require('./utils');

function getBaseName(classPath) {
    const ext = extname(classPath);
    return basename(classPath, ext);
}

function importDefaultTemplate(path, state) {
    const { filename } = state.file.opts;
    const componentName = getBaseName(filename);
    return moduleImports.addDefault(path, `./${componentName}.html`, {
        nameHint: TEMPLATE_KEY,
    });
}

function needsComponentRegistration(path) {
    return (
        (path.isIdentifier() && path.node.name !== 'undefined' && path.node.name !== 'null') ||
        // path.isMemberExpression() || // this will probably yield more false positives than anything else
        path.isCallExpression() ||
        path.isClassDeclaration() ||
        path.isConditionalExpression()
    );
}

module.exports = function ({ types: t }) {
    function createRegisterComponent(declarationPath, state) {
        const registerComponentId = moduleImports.addNamed(
            declarationPath,
            REGISTER_COMPONENT_ID,
            LWC_PACKAGE_ALIAS
        );
        const templateIdentifier = importDefaultTemplate(declarationPath, state);
        const statementPath = declarationPath.getStatementParent();
        let node = declarationPath.node;

        if (declarationPath.isClassDeclaration()) {
            const hasIdentifier = t.isIdentifier(node.id);
            if (hasIdentifier) {
                statementPath.insertBefore(node);
                node = node.id;
            } else {
                // if it does not have an id, we can treat it as a ClassExpression
                t.toExpression(node);
            }
        }

        return t.callExpression(registerComponentId, [
            node,
            t.objectExpression([t.objectProperty(t.identifier(TEMPLATE_KEY), templateIdentifier)]),
        ]);
    }

    function collectDecoratedProperties(body) {
        const metaPropertyList = [];
        for (const classProps of body.get('body')) {
            if (classProps.isClassProperty({ static: true })) {
                const propertyNode = classProps.node;
                if (isLWCNode(propertyNode)) {
                    metaPropertyList.push(t.objectProperty(propertyNode.key, propertyNode.value));
                    classProps.remove();
                }
            }
        }
        return metaPropertyList;
    }

    function collectObservedFields(body, decoratedProperties) {
        const mappers = {
            ObjectExpression: ({ properties }) =>
                properties.map(({ key }) => {
                    if (t.isIdentifier(key)) {
                        return key.name;
                    } else if (t.isStringLiteral(key)) {
                        return key.value;
                    }
                }),
            ArrayExpression: ({ elements }) => elements.map(({ value }) => value),
        };

        const decoratedIdentifiers = decoratedProperties
            .map(({ value }) => mappers[value.type](value))
            .reduce((acc, identifiers) => acc.concat(identifiers), []);

        const nonDecoratedFields = body
            .get('body')
            .filter(
                (path) =>
                    t.isClassProperty(path.node) &&
                    !isLWCNode(path.node) &&
                    !path.node.static &&
                    t.isIdentifier(path.node.key) &&
                    !(decoratedIdentifiers.indexOf(path.node.key.name) >= 0)
            )
            .map((path) => path.node.key.name);

        return nonDecoratedFields.length
            ? t.objectProperty(t.identifier('fields'), t.valueToNode(nonDecoratedFields))
            : null;
    }

    function collectMetaPropertyList(klassBody) {
        const metaPropertyList = collectDecoratedProperties(klassBody);
        const observedFields = collectObservedFields(klassBody, metaPropertyList);

        if (observedFields) {
            metaPropertyList.push(observedFields);
        }

        return metaPropertyList;
    }

    function createRegisterDecoratorsCall(path, klass, props) {
        const id = moduleImports.addNamed(path, REGISTER_DECORATORS_ID, 'lwc');

        return t.callExpression(id, [klass, t.objectExpression(props)]);
    }

    // Babel reinvokes visitors for node reinsertion so we use this to avoid an infinite loop.
    const visitedClasses = new WeakSet();

    return {
        Program(path) {
            const engineImportSpecifiers = getEngineImportSpecifiers(path);

            // validate internal api imports
            engineImportSpecifiers.forEach(({ name }) => {
                if (!LWC_SUPPORTED_APIS.has(name)) {
                    throw generateError(path, {
                        errorInfo: LWCClassErrors.INVALID_IMPORT_PROHIBITED_API,
                        messageArgs: [name],
                    });
                }
            });
        },
        Class(path) {
            const { node } = path;

            if (visitedClasses.has(node)) {
                return;
            }
            visitedClasses.add(node);

            const metaPropertyList = collectMetaPropertyList(path.get('body'));
            if (metaPropertyList.length === 0) {
                return;
            }

            const isAnonymousClassDeclaration =
                path.isClassDeclaration() && !t.isIdentifier(node.id);
            const transformAsClassExpression =
                path.isClassExpression() || isAnonymousClassDeclaration;

            if (transformAsClassExpression) {
                const classExpression = t.toExpression(node);
                path.replaceWith(
                    createRegisterDecoratorsCall(path, classExpression, metaPropertyList)
                );
            } else {
                const statementPath = path.getStatementParent();
                statementPath.insertAfter(
                    createRegisterDecoratorsCall(path, node.id, metaPropertyList)
                );
            }
        },
        ExportDefaultDeclaration(path, state) {
            const implicitResolution = !state.opts.isExplicitImport;
            if (implicitResolution) {
                const declaration = path.get('declaration');
                if (needsComponentRegistration(declaration)) {
                    declaration.replaceWith(createRegisterComponent(declaration, state));
                }
            }
        },
    };
};
