/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { resolvedPromiseScopedImportTransform } = require('./utils');

const APEX_IMPORT_IDENTIFIER = '@salesforce/apex';

module.exports = function ({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                if (path.get('source.value').node.startsWith(APEX_IMPORT_IDENTIFIER)) {
                    resolvedPromiseScopedImportTransform(t, path, APEX_IMPORT_IDENTIFIER);
                }
            }
        }
    };
};
