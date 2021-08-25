/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { HTMLSlotElement, TypeError } from '../env/global';

let assignedNodes: (options?: AssignedNodesOptions) => Node[],
    assignedElements: (options?: AssignedNodesOptions) => Element[];
if (typeof HTMLSlotElement !== 'undefined') {
    assignedNodes = HTMLSlotElement.prototype.assignedNodes;
    assignedElements = HTMLSlotElement.prototype.assignedElements;
} else {
    assignedNodes = () => {
        throw new TypeError(
            "assignedNodes() is not supported in current browser. Load the @lwc/synthetic-shadow polyfill to start using <slot> elements in your Lightning Web Component's template"
        );
    };
    assignedElements = () => {
        throw new TypeError(
            "assignedElements() is not supported in current browser. Load the @lwc/synthetic-shadow polyfill to start using <slot> elements in your Lightning Web Component's template"
        );
    };
}
export { assignedNodes, assignedElements };
