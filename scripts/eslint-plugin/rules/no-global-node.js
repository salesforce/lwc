/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const errorMessage = 'Avoid referencing the global Node constructor.';

function isGlobalRef(reference) {
    return reference.resolved === null || reference.resolved.scope.type === 'global';
}

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: errorMessage,
        },
    },

    create(context) {
        return {
            'Identifier[name="Node"]': function (node) {
                // Ignore typescript references
                if (node.parent.type === 'TSTypeReference') {
                    return;
                }

                // `scope.through` is the array of references which could not be resolved in this
                // scope (i.e., they were defined on another scope).
                const { through } = context.getScope();
                const reference = through.find((ref) => ref.identifier === node);
                if (reference && isGlobalRef(reference)) {
                    context.report({
                        node,
                        message: errorMessage,
                    });
                }
            },
        };
    },
};
