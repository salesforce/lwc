const { stringScopedImportTransform} = require('./utils');

const CONTENT_ASSET_URL_IMPORT_IDENTIFIER = '@salesforce/contentAssetUrl/';

module.exports = function ({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                if (path.get('source.value').node.startsWith(CONTENT_ASSET_URL_IMPORT_IDENTIFIER)) {
                    stringScopedImportTransform(t, path, CONTENT_ASSET_URL_IMPORT_IDENTIFIER);
                }
            }
        }
    };
};
