/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { generateError, getEngineImportSpecifiers } = require('./utils');
const { LWC_PACKAGE_EXPORTS, LWC_API_WHITELIST } = require('./constants');
const { LWCClassErrors } = require('@lwc/errors');

module.exports = function() {
    return {
        Program(path, state) {
            const engineImportSpecifiers = getEngineImportSpecifiers(path);

            // validate internal api imports
            engineImportSpecifiers.forEach(({ name }) => {
                if (!LWC_API_WHITELIST.has(name)) {
                    throw generateError(path, {
                        errorInfo: LWCClassErrors.INVALID_IMPORT_PROHIBITED_API,
                        messageArgs: [name],
                    });
                }
            });

            // Store on state local identifiers referencing engine base component
            state.componentBaseClassImports = engineImportSpecifiers
                .filter(({ name }) => name === LWC_PACKAGE_EXPORTS.BASE_COMPONENT)
                .map(({ path }) => path.get('local'));
        },

        ClassDeclaration(path, state) {
            const { node } = path;

            let superClassName = node.superClass && node.superClass.name;

            // check if LightningElement is mapped to another name during import
            if (superClassName && superClassName !== 'LightningElement') {
                superClassName = state.componentBaseClassImports.find(({ node }) => {
                    return node && node.name === superClassName;
                });
            }

            // don't validate components not extending from LightningElement
            if (superClassName) {
                const classBody = node.body.body;

                // find constructor
                const constructorMethod = classBody.find(statement => {
                    return statement.type === 'ClassMethod' && statement.key.name === 'constructor';
                });

                if (constructorMethod) {
                    const constructorBody = constructorMethod && constructorMethod.body.body;

                    // constructor cannot be empty
                    if (!constructorBody.length) {
                        throw generateError(path, {
                            errorInfo: LWCClassErrors.INVALID_CONSTRUCTOR,
                            messageArgs: [superClassName],
                        });
                    }

                    // ensure constructor body contains super()
                    if (
                        !constructorBody.find(constructorStatement => {
                            return (
                                constructorStatement.type === 'ExpressionStatement' &&
                                constructorStatement.expression.callee &&
                                constructorStatement.expression.callee.type === 'Super'
                            );
                        })
                    ) {
                        throw generateError(path, {
                            errorInfo: LWCClassErrors.INVALID_CONSTRUCTOR,
                            messageArgs: [superClassName],
                        });
                    }
                }
            }
        },
    };
};
