/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { stringScopedImportTransform } = require('./utils');

/*
 * We use the full path to `Id` instead of `@salesforce/user` like other transforms
 * because only retrieving the id is currently supported. This will need to be updated
 * if more properties are exposed.
 */
const USER_ID_IMPORT_IDENTIFIER = '@salesforce/user/Id';
const IS_GUEST_IMPORT_IDENTIFIER = '@salesforce/user/isGuest';

const DEFAULT_ID = '005000000000000000';
const DEFAULT_IS_GUEST = false;

module.exports = function({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                if (path.get('source.value').node.startsWith(USER_ID_IMPORT_IDENTIFIER)) {
                    stringScopedImportTransform(t, path, USER_ID_IMPORT_IDENTIFIER, DEFAULT_ID);
                } else if (path.get('source.value').node.startsWith(IS_GUEST_IMPORT_IDENTIFIER)) {
                    stringScopedImportTransform(
                        t,
                        path,
                        IS_GUEST_IMPORT_IDENTIFIER,
                        DEFAULT_IS_GUEST
                    );
                }
            },
        },
    };
};
