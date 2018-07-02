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
