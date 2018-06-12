const { defaultSchemaImportTransform} = require('./utils');

const RESOURCE_IMPORT_IDENTIFIER = '@resource-url/';

module.exports = function ({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                if (path.get('source.value').node.startsWith(RESOURCE_IMPORT_IDENTIFIER)) {
                    defaultSchemaImportTransform(t, path, RESOURCE_IMPORT_IDENTIFIER);
                }
            }
        }
    };
};
