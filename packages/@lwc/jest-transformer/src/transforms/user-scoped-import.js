const { stringScopedImportTransform } = require('./utils');

/*
 * We use the full path to `Id` instead of `@salesforce/user` like other transforms
 * because only retrieving the id is currently supported. This will need to be updated
 * if more properties are exposed.
 */
const USER_ID_IMPORT_IDENTIFIER = '@salesforce/user/Id';

const DEFAULT_ID = '005000000000000000';

module.exports = function ({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                if (path.get('source.value').node.startsWith(USER_ID_IMPORT_IDENTIFIER)) {
                    stringScopedImportTransform(t, path, USER_ID_IMPORT_IDENTIFIER, DEFAULT_ID);
                }
            }
        }
    };
};
