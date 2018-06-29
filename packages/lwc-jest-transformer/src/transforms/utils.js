const babelTemplate = require('@babel/template').default;

/*
 * For certain imports (@salesforce/label for example), transform a default import
 * statement into a try/catch that attempts to `require` the original import
 * and falls back to assigning the variable to a string of the path that was
 * attempted to be imported.
 *
 * This approach gives these special imports a default value to ease testing
 * components with imports, but allows test authors to call `jest.mock()` to
 * provide their own value.
 *
 * Example:
 *
 * import myImport from '@salesforce/label/c.specialLabel';
 *
 * Will get transformed to:
 *
 * let myImport;
 * try {
 *     myImport = require(@salesforce/label/c.specialLabel);
 * } catch (e) {
 *     myImport = c.specialLabel;
 * }
 */
function defaultScopedImportTransform(t, path, importIdentifier) {
    const tmpl = babelTemplate(`
        let RESOURCE_NAME;
        try {
            RESOURCE_NAME = require(IMPORT_SOURCE).default;
        } catch (e) {
            RESOURCE_NAME = RESOURCE_PATH;
        }
    `);

    const importSource = path.get('source.value').node;
    const importSpecifiers = path.get('specifiers');
    if (importSpecifiers.length !== 1 || !importSpecifiers[0].isImportDefaultSpecifier()) {
        throw path.buildCodeFrameError(`Invalid import from ${importSource}. Only import the default using the following syntax: "import foo from '@salesforce/label/c.foo'"`);
    }

    const resourceName = importSpecifiers[0].get('local').node.name;
    const resourcePath = importSource.substring(importIdentifier.length);

    path.replaceWithMultiple(tmpl({
        RESOURCE_NAME: t.identifier(resourceName),
        IMPORT_SOURCE: t.stringLiteral(importSource),
        RESOURCE_PATH: t.stringLiteral(resourcePath)
    }));
}

module.exports = {
    defaultScopedImportTransform
};
