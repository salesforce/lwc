const { stringScopedImportTransform} = require('./utils');

const RESOURCE_IMPORT_IDENTIFIER = '@salesforce/resourceUrl/';

module.exports = function ({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                if (path.get('source.value').node.startsWith(RESOURCE_IMPORT_IDENTIFIER)) {
                    stringScopedImportTransform(t, path, RESOURCE_IMPORT_IDENTIFIER);
                }
            }
        }
    };
};
