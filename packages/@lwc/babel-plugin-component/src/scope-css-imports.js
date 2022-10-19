/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Add ?scoped=true to any imports ending with .scoped.css. This signals that the stylesheet
// should be treated as "scoped".
module.exports = function ({ types: t }, path) {
    const programPath = path.isProgram() ? path : path.findParent((node) => node.isProgram());

    return programPath.get('body').forEach((node) => {
        const source = node.get('source');
        if (
            node.isImportDeclaration() &&
            source.type === 'StringLiteral' &&
            source.node.value.endsWith('.scoped.css')
        ) {
            source.replaceWith(t.stringLiteral(source.node.value + '?scoped=true'));
        }
    });
};
