/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

function defaultImport(t, specifiers) {
    const defaultImport = specifiers.find((s) => t.isImportDefaultSpecifier(s));
    return defaultImport && defaultImport.local.name;
}

module.exports = function ({ types: t }) {
    return function (path) {
        const body = path.get('body');
        const importStatements = body.filter((s) => s.isImportDeclaration());
        const visited = new Map();

        importStatements.forEach((importPath) => {
            const sourceLiteral = importPath.node.source;

            // If the import is of the type import * as X, just ignore it since we can't dedupe
            if (importPath.node.specifiers.some(t.isImportNamespaceSpecifier)) {
                return;
            }

            // If we have seen the same source, we will try to dedupe it
            if (visited.has(sourceLiteral.value)) {
                const visitedImport = visited.get(sourceLiteral.value);
                const visitedSpecifiers = visitedImport.node.specifiers;
                const visitedDefaultImport = defaultImport(t, visitedSpecifiers);

                // We merge all the named imports unless is a default with the same name
                let canImportBeRemoved = true;
                importPath.node.specifiers.forEach((s) => {
                    if (visitedDefaultImport && t.isImportDefaultSpecifier(s)) {
                        if (visitedDefaultImport !== s.local.name) {
                            canImportBeRemoved = false;
                        }
                    } else {
                        visitedSpecifiers.push(s);
                    }
                });

                if (canImportBeRemoved) {
                    importPath.remove();
                }

                // We need to sort the imports due to a bug in babel where default must be first
                visitedSpecifiers.sort((a) => (t.isImportDefaultSpecifier(a) ? -1 : 1));
            } else {
                visited.set(sourceLiteral.value, importPath);
            }
        });
    };
};
