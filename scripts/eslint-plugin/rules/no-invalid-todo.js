/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const TODO_REGEX = /\*?\s+(TODO|todo)/;
const VALID_TODO_REGEX = /\*?\s+(TODO|todo) \[((#\d+)|(\S+\/\S+#\d+)|(W-\d+))\]:/;

/**
 * This eslint rule checks that all the TODO comments contains a reference to a git issue or a GUS
 * bug.
 *
 * Valid comment formats:
 *   - `// TODO [#1234]: This is a todo`
 *   - `// TODO [salesforce/observable-membrane#1234]: This is a todo`
 *   - `// TODO [W-123456]: this is a todo`
 */
module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Restrict usage of TODO in comments.',
        },
    },

    create(context) {
        const sourceCode = context.getSourceCode();

        function checkComment(comment) {
            const { value } = comment;

            const isTodo = value.match(TODO_REGEX);
            const isValidTodo = value.match(VALID_TODO_REGEX);

            if (isTodo && !isValidTodo) {
                context.report({
                    node: comment,
                    message:
                        'Invalid TODO comment format, the git issue reference is probably missing.',
                });
            }
        }

        return {
            Program() {
                const comments = sourceCode.getAllComments();

                for (const comment of comments) {
                    checkComment(comment);
                }
            },
        };
    },
};
