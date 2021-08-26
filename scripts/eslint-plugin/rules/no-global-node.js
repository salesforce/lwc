/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// TODO [#2472]: Remove this lint rule when appropriate.
const errorMessage = 'Avoid referencing the global Node constructor directly.';

function isGlobalRef(ref) {
    return ref.resolved === null || ref.resolved.scope.type === 'global';
}

function isTypescriptType(type) {
    return /Interface|Type/.test(type);
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
                if (isTypescriptType(node.parent.type)) {
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
