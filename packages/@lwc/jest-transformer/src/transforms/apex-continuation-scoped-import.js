/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { getImportInfo, resolvedPromiseTemplate } = require('./utils');

const APEX_CONTINUATION_IMPORT_IDENTIFIER = '@salesforce/apexContinuation';

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
