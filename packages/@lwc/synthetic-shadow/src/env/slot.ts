/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

let assignedNodes, assignedElements;
if (typeof HTMLSlotElement !== 'undefined') {
    assignedNodes = HTMLSlotElement.prototype.assignedNodes;
    assignedElements = HTMLSlotElement.prototype.assignedElements;
}
export { assignedNodes, assignedElements };
