/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { LWCClassErrors } = require('@lwc/errors');

const { generateError, getEngineImportSpecifiers } = require('./utils');
const { LWC_PACKAGE_EXPORTS, LWC_SUPPORTED_APIS } = require('./constants');

module.exports = function () {
    return {
        Program(path, state) {
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

            // Store on state local identifiers referencing engine base component
            state.componentBaseClassImports = engineImportSpecifiers
                .filter(({ name }) => name === LWC_PACKAGE_EXPORTS.BASE_COMPONENT)
                .map(({ path }) => path.get('local'));
        },
    };
};
