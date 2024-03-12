/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 * This eslint rule checks that there are no "LWC test" directives, which are only intended for local use
 */
const LWC_TEST_REGEX = /\bLWC test /i;
module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow LWC test directives in comments.',
        },
    },

    create(context) {
        const sourceCode = context.getSourceCode();
        return {
            Program() {
                for (const comment of sourceCode.getAllComments()) {
                    if (LWC_TEST_REGEX.test(comment.value)) {
                        context.report({
                            node: comment,
                            message: 'Unexpected LWC test directive; remove before committing.',
                        });
                    }
                }
            },
        };
    },
};
