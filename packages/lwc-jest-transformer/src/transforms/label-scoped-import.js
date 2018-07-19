const { stringScopedImportTransform } = require('./utils');

const LABEL_IMPORT_IDENTIFIER = '@salesforce/label/';
const LEGACY_LABEL_IMPORT_IDENTIFIER = '@label/';

module.exports = function ({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                if (path.get('source.value').node.startsWith(LABEL_IMPORT_IDENTIFIER)) {
                    stringScopedImportTransform(t, path, LABEL_IMPORT_IDENTIFIER);
                } else if (path.get('source.value').node.startsWith(LEGACY_LABEL_IMPORT_IDENTIFIER)) {
                    stringScopedImportTransform(t, path, LEGACY_LABEL_IMPORT_IDENTIFIER);
                }
            }
        }
    };
};
