/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { stringScopedImportTransform } = require('./utils');

const SITE_IMPORT_IDENTIFIER = '@salesforce/site/';
const NETWORK_ID_IMPORT_IDENTIFIER = '@salesforce/site/NetworkId';

// We use IdUtil.EMPTY_KEY for default network id
const DEFAULT_NETWORK_ID = '000000000000000';

module.exports = function({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                const importId = path.get('source.value').node;

                if (importId.startsWith(SITE_IMPORT_IDENTIFIER)) {
                    if (importId === NETWORK_ID_IMPORT_IDENTIFIER) {
                        stringScopedImportTransform(
                            t,
                            path,
                            NETWORK_ID_IMPORT_IDENTIFIER,
                            DEFAULT_NETWORK_ID
                        );
                    }
                }
            },
        },
    };
};
