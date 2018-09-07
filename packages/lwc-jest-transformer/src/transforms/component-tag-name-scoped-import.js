const { stringScopedImportTransform } = require('./utils');

const COMPONENT_TAG_NAME_IMPORT_IDENTIFIER = '@salesforce/componentTagName/';

module.exports = function ({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                if (path.get('source.value').node.startsWith(COMPONENT_TAG_NAME_IMPORT_IDENTIFIER)) {
                    stringScopedImportTransform(t, path, COMPONENT_TAG_NAME_IMPORT_IDENTIFIER);
                }
            }
        }
    };
};
