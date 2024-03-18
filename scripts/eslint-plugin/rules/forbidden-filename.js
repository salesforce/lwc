/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');

/**
 * This eslint rule always triggers an error for whichever files use it. It is intended for use as
 * an override to warn against specific files being committed, without completely blocking them by
 * including them in the .gitignore.
 */
module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Complain that the filename is not allowed.',
        },
    },
    create(context) {
        const basename = path.basename(context.filename);
        return {
            Program(node) {
                context.report({
                    node,
                    message: `Filename "${basename}" is not allowed.`,
                });
            },
        };
    },
};
