/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { LWC_VERSION_COMMENT } = require('@lwc/shared');

module.exports = function compilerVersionNumber({ types: t }) {
    return {
        ClassBody(path) {
            if (path.parent.superClass === null) {
                // Components *must* extend from either LightningElement or some other superclass (e.g. a mixin).
                // We can skip classes without a superclass to avoid adding unnecessary comments.
                return;
            }
            // If the class body is empty, we want an inner comment. Otherwise we want it after the last child
            // of the class body. In either case, we want it right before the `}` at the end of the function body.
            if (path.node.body.length > 0) {
                // E.g. `class Foo extends Lightning Element { /*LWC compiler v1.2.3*/ }`
                t.addComment(
                    path.node.body[path.node.body.length - 1],
                    'trailing',
                    LWC_VERSION_COMMENT,
                    /* line */ false
                );
            } else {
                // E.g. `class Foo extends Lightning Element { bar = 'baz'; /*LWC compiler v1.2.3*/ }`
                t.addComment(path.node, 'inner', LWC_VERSION_COMMENT, /* line */ false);
            }
        },
    };
};
