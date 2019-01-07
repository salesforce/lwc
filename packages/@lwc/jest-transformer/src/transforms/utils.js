/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
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
    const { importSource, resourceNames } = getImportInfo(path);
    const defaultImport = resourceNames[0];

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
        RESOURCE_NAME: t.identifier(defaultImport),
        IMPORT_SOURCE: t.stringLiteral(importSource),
        FALLBACK_DATA: fallbackData
    }));
}

function schemaScopedImportTransform(t, path, importIdentifier) {
    const { importSource, resourceNames } = getImportInfo(path);
    const defaultImport = resourceNames[0];

    const resourcePath = importSource.substring(importIdentifier.length + 1);
    const idx = resourcePath.indexOf('.');

    if (idx === -1) {
        path.replaceWithMultiple(schemaObjectTemplate({
            RESOURCE_NAME: t.identifier(defaultImport),
            IMPORT_SOURCE: t.stringLiteral(importSource),
            OBJECT_API_NAME: t.stringLiteral(resourcePath),
        }));
    } else {
        path.replaceWithMultiple(schemaObjectAndFieldTemplate({
            RESOURCE_NAME: t.identifier(defaultImport),
            IMPORT_SOURCE: t.stringLiteral(importSource),
            OBJECT_API_NAME: t.stringLiteral(resourcePath.substring(0, idx)),
            FIELD_API_NAME: t.stringLiteral(resourcePath.substring(idx + 1)),
        }));
    }
}

/**
 * For an import statement we want to transform, parse out the names of the
 * resources and the source of the import.
 *
 * @param {Object} path Object representation of link between nodes, from Babel
 * @param {Boolean} noValidate true to allow named imports. Falsey values throws
 * for any non-default imports
 * @returns {Object} an Object with the source of the import and Array of names
 * of the resources being imported
 */
function getImportInfo(path, noValidate) {
    const importSource = path.get('source.value').node;
    const importSpecifiers = path.get('specifiers');

    if (!noValidate && (importSpecifiers.length !== 1 || !importSpecifiers[0].isImportDefaultSpecifier())) {
        throw generateError(path, {
            errorInfo: JestTransformerErrors.INVALID_IMPORT,
            messageArgs: [importSource]
        });
    }

    let resourceNames = [];
    importSpecifiers.forEach(importSpecifier => {
        resourceNames.push(importSpecifier.get('local').node.name);
    });

    return {
        importSource,
        resourceNames,
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
    schemaScopedImportTransform,
    getImportInfo,
};
