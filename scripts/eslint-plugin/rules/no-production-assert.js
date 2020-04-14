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
            description: 'Avoid leaking asserts into production code.',
        },
    },

    create(context) {
        const sourceCode = context.getSourceCode();

        return {
            CallExpression(node) {
                const isAssertCallExpression = sourceCode.getText(node).startsWith('assert.');

                if (isAssertCallExpression) {
                    const isGuarded = context.getAncestors().some((ancestor) => {
                        return (
                            ancestor.type === 'IfStatement' &&
                            sourceCode.getText(ancestor.test) ===
                                `process.env.NODE_ENV !== 'production'`
                        );
                    });

                    if (!isGuarded) {
                        context.report({
                            node,
                            message:
                                'Unexpected assert statement not guarded by a if production check.',
                        });
                    }
                }
            },
        };
    },
};
