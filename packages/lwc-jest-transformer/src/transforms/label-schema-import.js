const { defaultSchemaImportTransform} = require('./utils');

const LABEL_IMPORT_IDENTIFIER = '@label/';

module.exports = function ({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                if (path.get('source.value').node.startsWith(LABEL_IMPORT_IDENTIFIER)) {
                    defaultSchemaImportTransform(t, path, LABEL_IMPORT_IDENTIFIER);
                }
            }
        }
    };
};
