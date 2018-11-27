const { generateErrorMessage, JestTransformerErrors } = require('@lwc/errors');
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
        RESOURCE_NAME = { objectApiName: OBJECT_API_NAME };
    }
`);

const schemaObjectAndFieldTemplate = babelTemplate(`
    let RESOURCE_NAME;
    try {
        RESOURCE_NAME = require(IMPORT_SOURCE).default;
    } catch (e) {
        RESOURCE_NAME = { objectApiName: OBJECT_API_NAME, fieldApiName: FIELD_API_NAME };
    }
`);

/*
 * Transform a default import
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
    const { importSource, resourceName } = getImportInfo(path);

    // if no fallback value provided, use the resource path from the import statement
    if (fallbackData === undefined) {
        fallbackData = importSource.substring(importIdentifier.length);
    }

    if (typeof fallbackData === 'number') {
        fallbackData = t.numericLiteral(fallbackData);
    } else {
        fallbackData = t.stringLiteral(fallbackData);
    }

    path.replaceWithMultiple(defaultTemplate({
        RESOURCE_NAME: t.identifier(resourceName),
        IMPORT_SOURCE: t.stringLiteral(importSource),
        FALLBACK_DATA: fallbackData
    }));
}

function resolvedPromiseScopedImportTransform(t, path) {
    const { importSource, resourceName } = getImportInfo(path);

    path.replaceWithMultiple(resolvedPromiseTemplate({
        RESOURCE_NAME: t.identifier(resourceName),
        IMPORT_SOURCE: t.stringLiteral(importSource),
    }));
}

function schemaScopedImportTransform(t, path, importIdentifier) {
    const { importSource, resourceName } = getImportInfo(path);

    const resourcePath = importSource.substring(importIdentifier.length + 1);
    const idx = resourcePath.indexOf('.');

    if (idx === -1) {
        path.replaceWithMultiple(schemaObjectTemplate({
            RESOURCE_NAME: t.identifier(resourceName),
            IMPORT_SOURCE: t.stringLiteral(importSource),
            OBJECT_API_NAME: t.stringLiteral(resourcePath),
        }));
    } else {
        path.replaceWithMultiple(schemaObjectAndFieldTemplate({
            RESOURCE_NAME: t.identifier(resourceName),
            IMPORT_SOURCE: t.stringLiteral(importSource),
            OBJECT_API_NAME: t.stringLiteral(resourcePath.substring(0, idx)),
            FIELD_API_NAME: t.stringLiteral(resourcePath.substring(idx + 1)),
        }));
    }
}

function getImportInfo(path) {
    const importSource = path.get('source.value').node;
    const importSpecifiers = path.get('specifiers');

    if (importSpecifiers.length !== 1 || !importSpecifiers[0].isImportDefaultSpecifier()) {
        throw generateError(path, {
            errorInfo: JestTransformerErrors.INVALID_IMPORT,
            messageArgs: [importSource]
        });
    }

    const resourceName = importSpecifiers[0].get('local').node.name;

    return {
        importSource,
        resourceName,
    };
}

/**
 * Helper function for throwing a consistent error
 * @param {*} path
 * @param {*} config {
 *      errorInfo: Reference to the error info object,
 *      messageArgs: Array of arguments for the error message
 * }
 */
function generateError(path, { errorInfo, messageArgs } = {}) {
    const message = generateErrorMessage(errorInfo, messageArgs);
    const error = path.buildCodeFrameError(message);

    error.lwcCode = errorInfo.code;

    return error;
}

module.exports = {
    stringScopedImportTransform,
    resolvedPromiseScopedImportTransform,
    schemaScopedImportTransform,
};
