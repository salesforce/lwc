/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { stringScopedImportTransform } = require('./utils');

const CONTENT_ASSET_URL_IMPORT_IDENTIFIER = '@salesforce/contentAssetUrl/';

module.exports = function({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                if (path.get('source.value').node.startsWith(CONTENT_ASSET_URL_IMPORT_IDENTIFIER)) {
                    stringScopedImportTransform(t, path, CONTENT_ASSET_URL_IMPORT_IDENTIFIER);
                }
            },
        },
    };
};
