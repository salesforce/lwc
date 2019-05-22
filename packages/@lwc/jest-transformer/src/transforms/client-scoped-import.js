/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { stringScopedImportTransform } = require('./utils');

const CLIENT_IMPORT_IDENTIFIER = '@salesforce/client/';
const WHITELISTED_RESOURCE_MOCK_VALUE = {
    formFactor: 'Large',
};

module.exports = function({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                const importId = path.get('source.value').node;

                if (importId.startsWith(CLIENT_IMPORT_IDENTIFIER)) {
                    const resourceId = importId.substring(CLIENT_IMPORT_IDENTIFIER.length);
                    const mockValue = WHITELISTED_RESOURCE_MOCK_VALUE[resourceId];

                    stringScopedImportTransform(t, path, importId, mockValue);
                }
            },
        },
    };
};
