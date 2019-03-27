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
    } else if (typeof fallbackData === 'boolean') {
        fallbackData = t.booleanLiteral(fallbackData);
    } else {
        fallbackData = t.stringLiteral(fallbackData);
    }

    path.replaceWithMultiple(
        defaultTemplate({
            RESOURCE_NAME: t.identifier(defaultImport),
            IMPORT_SOURCE: t.stringLiteral(importSource),
            FALLBACK_DATA: fallbackData,
        })
    );
}

/*
 * Apex imports can be used as @wire ids or called directly. If used as a @wire
 * id, it must be the same object in the component under test and the test case
 * itself. Due to this requirement, we save the mock to the global object to be
 * shared.
 */
const resolvedPromiseTemplate = babelTemplate(`
    let RESOURCE_NAME;
    try {
        RESOURCE_NAME = require(IMPORT_SOURCE).default;
    } catch (e) {
        global.MOCK_NAME = global.MOCK_NAME || function RESOURCE_NAME() { return Promise.resolve(); };
        RESOURCE_NAME = global.MOCK_NAME;
    }
`);

/**
 * For an import statement we want to transform, parse out the names of the
 * resources and the source of the import.
 *
 * @param {Object} path Object representation of link between nodes, from Babel
 * @param {Boolean} noValidate true to allow named imports; false throws if non-default imports are present
 * @returns {Object} an Object with the source of the import and Array of names
 * of the resources being imported
 */
function getImportInfo(path, noValidate) {
    const importSource = path.get('source.value').node;
    const importSpecifiers = path.get('specifiers');

    if (
        !noValidate &&
        (importSpecifiers.length !== 1 || !importSpecifiers[0].isImportDefaultSpecifier())
    ) {
        throw generateError(path, {
            errorInfo: JestTransformerErrors.INVALID_IMPORT,
            messageArgs: [importSource],
        });
    }

    const resourceNames = importSpecifiers.map(
        importSpecifier => importSpecifier.get('local').node.name
    );

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
    resolvedPromiseTemplate,
    getImportInfo,
};
