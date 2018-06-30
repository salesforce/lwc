const babelTemplate = require('@babel/template').default;

const defaultTemplate = babelTemplate(`
    let RESOURCE_NAME;
    try {
        RESOURCE_NAME = require(IMPORT_SOURCE).default;
    } catch (e) {
        RESOURCE_NAME = FALLBACK_DATA;
    }
`);

const resolvedPromiseTemplate = babelTemplate(`
    let RESOURCE_NAME;
    try {
        RESOURCE_NAME = require(IMPORT_SOURCE).default;
    } catch (e) {
        RESOURCE_NAME = function() { return Promise.resolve(); };
    }
`);

const schemaObjectTemplate = babelTemplate(`
    let RESOURCE_NAME;
    try {
        RESOURCE_NAME = require(IMPORT_SOURCE).default;
    } catch (e) {
        RESOURCE_NAME = { objectApiName: OBJECT_API_NAME, fieldApiName: FIELD_API_NAME };
    }
`);

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
function stringScopedImportTransform(t, path, importIdentifier, fallbackData) {
    const importSource = path.get('source.value').node;
    const importSpecifiers = path.get('specifiers');

    if (importSpecifiers.length !== 1 || !importSpecifiers[0].isImportDefaultSpecifier()) {
        throw path.buildCodeFrameError(`Invalid import from ${importSource}. Only import the default using the following syntax: "import foo from '@salesforce/label/c.foo'"`);
    }

    const resourceName = importSpecifiers[0].get('local').node.name;
    // if no fallback value provided, use the resource path from the import statement
    fallbackData = fallbackData || importSource.substring(importIdentifier.length);

    path.replaceWithMultiple(defaultTemplate({
        RESOURCE_NAME: t.identifier(resourceName),
        IMPORT_SOURCE: t.stringLiteral(importSource),
        FALLBACK_DATA: t.stringLiteral(fallbackData)
    }));
}

function resolvedPromiseScopedImportTransform(t, path) {
    const importSource = path.get('source.value').node;
    const importSpecifiers = path.get('specifiers');

    if (importSpecifiers.length !== 1 || !importSpecifiers[0].isImportDefaultSpecifier()) {
        throw path.buildCodeFrameError(`Invalid import from ${importSource}. Only import the default using the following syntax: "import foo from '@salesforce/label/c.foo'"`);
    }

    const resourceName = importSpecifiers[0].get('local').node.name;

    path.replaceWithMultiple(resolvedPromiseTemplate({
        RESOURCE_NAME: t.identifier(resourceName),
        IMPORT_SOURCE: t.stringLiteral(importSource),
    }));
}

function schemaScopedImportTransform(t, path, importIdentifier) {
    let objectApiName, fieldApiName;
    const importSource = path.get('source.value').node;
    const importSpecifiers = path.get('specifiers');

    if (importSpecifiers.length !== 1 || !importSpecifiers[0].isImportDefaultSpecifier()) {
        throw path.buildCodeFrameError(`Invalid import from ${importSource}. Only import the default using the following syntax: "import foo from '@salesforce/label/c.foo'"`);
    }

    const resourceName = importSpecifiers[0].get('local').node.name;
    const resourcePath = importSource.substring(importIdentifier.length + 1);
    const idx = resourcePath.indexOf('.');

    if (idx === -1) {
        objectApiName = resourcePath;
        fieldApiName = t.identifier('undefined');
    } else {
        objectApiName = resourcePath.substring(0, idx);
        fieldApiName = t.stringLiteral(resourcePath.substring(idx + 1));
    }

    path.replaceWithMultiple(schemaObjectTemplate({
        RESOURCE_NAME: t.identifier(resourceName),
        IMPORT_SOURCE: t.stringLiteral(importSource),
        OBJECT_API_NAME: t.stringLiteral(objectApiName),
        FIELD_API_NAME: fieldApiName,
    }));
}

module.exports = {
    stringScopedImportTransform,
    resolvedPromiseScopedImportTransform,
    schemaScopedImportTransform,
};

// TODO(tbliss):
// - DRY-ify these transforms to get resourceName and resourcePath from single function
// - schema to build object manually to exclude fieldApiName entry when not present (instead of entry that equals undefined)
