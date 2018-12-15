/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { schemaScopedImportTransform } = require('./utils');

const SCHEMA_IMPORT_IDENTIFIER = '@salesforce/schema';

module.exports = function ({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                if (path.get('source.value').node.startsWith(SCHEMA_IMPORT_IDENTIFIER)) {
                    schemaScopedImportTransform(t, path, SCHEMA_IMPORT_IDENTIFIER);
                }
            }
        }
    };
};
