/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Avoid using uncached Node reference for instanceof test',
        },
    },

    create(context) {
        return {
            'Identifier[name="Node"]': function (node) {
                const parent = node.parent;
                if (parent.type === 'BinaryExpression' && parent.operator === 'instanceof') {
                    const scope = context.getScope();
                    scope.references.forEach((ref) => {
                        if (ref.identifier.name === 'Node' && ref.resolved === null) {
                            context.report({
                                node,
                                message: `Avoid using uncached Node reference for instanceof test`,
                            });
                        }
                    });
                }
            },
        };
    },
};
