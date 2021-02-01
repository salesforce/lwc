/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { basename, extname } = require('path');

const moduleImports = require('@babel/helper-module-imports');
const { LWCClassErrors } = require('@lwc/errors');

const { LWC_SUPPORTED_APIS, REGISTER_COMPONENT_ID } = require('./constants');
const { generateError, getEngineImportSpecifiers } = require('./utils');

module.exports = function ({ types: t }) {
    function getBaseName({ file }) {
        const classPath = file.opts.filename;
        const ext = extname(classPath);
        return basename(classPath, ext);
    }

    function importDefaultTemplate(path, state) {
        const componentName = getBaseName(state);
        return moduleImports.addDefault(path, `./${componentName}.html`, {
            nameHint: 'tmpl',
        });
    }

    function createRegisterComponent(declarationPath, state) {
        const id = moduleImports.addNamed(declarationPath, REGISTER_COMPONENT_ID, 'lwc');
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
                node.type = 'ClassExpression';
            }
        }

        return t.callExpression(id, [
            node,
            t.objectExpression([t.objectProperty(t.identifier('tmpl'), templateIdentifier)]),
        ]);
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
