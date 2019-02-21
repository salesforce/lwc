/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Root, Result } from 'postcss';
import valueParser from 'postcss-value-parser';

import { importMessage } from '../utils/message';

export default function process(root: Root, result: Result) {
    root.walkAtRules('import', node => {
        // Ensure @import are at the top of the file
        let prev = node.prev();
        while (prev) {
            if (prev.type === 'comment' || (prev.type === 'atrule' && prev.name === 'import')) {
                prev = prev.prev();
            } else {
                throw prev.error('@import must precede all other statements');
            }
        }

        const { nodes: params } = valueParser(node.params);

        // Ensure import match the following syntax:
        //     @import "foo";
        //     @import "./foo.css";
        if (!params.length || (params[0].type !== 'string' || !params[0].value)) {
            throw node.error(`Invalid import statement, unable to find imported module.`);
        }

        if (params.length > 1) {
            throw node.error(
                `Invalid import statement, import statement only support a single parameter.`
            );
        }

        // Add the imported to results messages
        const message = importMessage(params[0].value);
        result.messages.push(message);

        // Remove the import from the generated css
        node.remove();
    });
}
