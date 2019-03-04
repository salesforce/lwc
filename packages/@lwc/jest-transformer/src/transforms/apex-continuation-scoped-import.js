/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const babelTemplate = require('@babel/template').default;
const { getImportInfo } = require('./utils');

const APEX_CONTINUATION_IMPORT_IDENTIFIER = '@salesforce/apexContinuation';

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
        global.MOCK_NAME = global.MOCK_NAME || function() { return Promise.resolve(); };
        RESOURCE_NAME = global.MOCK_NAME;
    }
`);

module.exports = function({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                const { importSource, resourceNames } = getImportInfo(path, true);

                if (importSource.startsWith(APEX_CONTINUATION_IMPORT_IDENTIFIER)) {
                    // importing anything after '@salesforce/apexContinuation' means they're getting a single Apex method as the default import
                    // e.g. `import myMethod from '@salesforce/apexContinuation/FooController.fooMethod';`
                    path.replaceWithMultiple(
                        resolvedPromiseTemplate({
                            RESOURCE_NAME: t.identifier(resourceNames[0]),
                            IMPORT_SOURCE: t.stringLiteral(importSource),
                            MOCK_NAME: `__lwcJestMock_${resourceNames[0]}`,
                        })
                    );
                }
            },
        },
    };
};
