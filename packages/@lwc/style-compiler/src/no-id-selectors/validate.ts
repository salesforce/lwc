/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Root } from 'postcss-selector-parser';

export default function(root: Root) {
    root.walkIds(node => {
        const message = `Invalid usage of id selector '#${
            node.value
        }'. Try using a class selector or some other selector.`;
        throw root.error(message, {
            index: node.sourceIndex,
            word: node.value,
        });
    });
}
