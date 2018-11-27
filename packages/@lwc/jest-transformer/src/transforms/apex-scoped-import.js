const { resolvedPromiseScopedImportTransform } = require('./utils');

const APEX_IMPORT_IDENTIFIER = '@salesforce/apex';

module.exports = function ({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                if (path.get('source.value').node.startsWith(APEX_IMPORT_IDENTIFIER)) {
                    resolvedPromiseScopedImportTransform(t, path, APEX_IMPORT_IDENTIFIER);
                }
            }
        }
    };
};
