/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { getImportInfo, resolvedPromiseTemplate } = require('./utils');

const APEX_IMPORT_IDENTIFIER = '@salesforce/apex';

/**
 * Instead of using @babel/template, we manually build the variable declaration
 * and try/catch block since we don't know how many named imports we have and
 * each one needs it's own try/catch block.
 */
function insertNamedImportReplacement(t, path, resource) {
    // jest.fn();
    const jestFn = t.callExpression(
        t.memberExpression(t.identifier('jest'), t.identifier('fn')),
        []
    );

    // function() { return Promise.resolve(); };
    const resolvedPromise = t.functionExpression(
        null,
        [],
        t.blockStatement([
            t.returnStatement(
                t.callExpression(
                    t.memberExpression(t.identifier('Promise'), t.identifier('resolve')),
                    []
                )
            ),
        ])
    );

    // we know refreshApex returns a Promise, default to jest.fn() to try to be future proof
    const fallbackValue = resource === 'refreshApex' ? resolvedPromise : jestFn;

    // `let refreshApex;`
    path.insertBefore(t.variableDeclaration('let', [t.VariableDeclarator(t.identifier(resource))]));

    // try/catch block
    path.insertBefore(
        t.tryStatement(
            // `refreshApex = require('@salesforce/apex').refreshApex;`
            t.blockStatement([
                t.expressionStatement(
                    t.assignmentExpression(
                        '=',
                        t.identifier(resource),
                        t.memberExpression(
                            t.callExpression(t.identifier('require'), [
                                t.stringLiteral(APEX_IMPORT_IDENTIFIER),
                            ]),
                            t.identifier(resource)
                        )
                    )
                ),
            ]),
            // catch block: `refreshApex = jest.fn()`
            t.catchClause(
                t.identifier('e'),
                t.blockStatement([
                    t.expressionStatement(
                        t.assignmentExpression('=', t.identifier(resource), fallbackValue)
                    ),
                ])
            )
        )
    );
}

module.exports = function({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                const { importSource, resourceNames } = getImportInfo(path, true);

                // if '@salesforce/apex' is the exact source that means we have named imports
                // e.g. `import { refreshApex, getSObjectValue } from '@salesforce/apex';`
                if (importSource === APEX_IMPORT_IDENTIFIER) {
                    // add a try/catch block defining the imported resource for each named import
                    resourceNames.forEach(resource => {
                        insertNamedImportReplacement(t, path, resource);
                    });

                    // remove the original import statement
                    path.remove();
                } else if (importSource.startsWith(APEX_IMPORT_IDENTIFIER)) {
                    // importing anything after '@salesforce/apex' means they're getting a single Apex method as the default import
                    // e.g. `import myMethod from '@salesforce/apex/FooController.fooMethod';`
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
