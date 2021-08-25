/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

function isGlobalRef(reference) {
    return reference.resolved === null || reference.resolved.scope.type === 'global';
}

const ignoreNames = new Set(['process', 'undefined']);

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Avoid referencing global objects directly.',
        },
    },

    create(context) {
        return {
            Identifier: function (node) {
                if (ignoreNames.has(node.name) || /Type|Interface/.test(node.parent.type)) {
                    return;
                }

                // `scope.through` is the array of references which could not be resolved in this
                // scope (i.e., they were defined on another scope).
                const { through } = context.getScope();
                const reference = through.find((ref) => ref.identifier === node);
                if (reference && isGlobalRef(reference)) {
                    context.report({
                        node,
                        message: `Avoid using the global '${node.name}' reference directly.`,
                    });
                }
            },
        };
    },
};
