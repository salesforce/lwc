/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const babelTemplate = require('@babel/template').default;
const { getImportInfo } = require('./utils');

const SCHEMA_IMPORT_IDENTIFIER = '@salesforce/schema';

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

function schemaScopedImportTransform(t, path) {
    const { importSource, resourceNames } = getImportInfo(path);
    const defaultImport = resourceNames[0];

    const resourcePath = importSource.substring(SCHEMA_IMPORT_IDENTIFIER.length + 1);
    const idx = resourcePath.indexOf('.');

    if (idx === -1) {
        path.replaceWithMultiple(
            schemaObjectTemplate({
                RESOURCE_NAME: t.identifier(defaultImport),
                IMPORT_SOURCE: t.stringLiteral(importSource),
                OBJECT_API_NAME: t.stringLiteral(resourcePath),
            })
        );
    } else {
        path.replaceWithMultiple(
            schemaObjectAndFieldTemplate({
                RESOURCE_NAME: t.identifier(defaultImport),
                IMPORT_SOURCE: t.stringLiteral(importSource),
                OBJECT_API_NAME: t.stringLiteral(resourcePath.substring(0, idx)),
                FIELD_API_NAME: t.stringLiteral(resourcePath.substring(idx + 1)),
            })
        );
    }
}

module.exports = function({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                if (path.get('source.value').node.startsWith(SCHEMA_IMPORT_IDENTIFIER)) {
                    schemaScopedImportTransform(t, path);
                }
            },
        },
    };
};
