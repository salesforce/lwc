/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getOwnPropertyDescriptor, hasOwnProperty } from '@lwc/shared';

const parentNodeGetter: (this: Node) => Element | null = getOwnPropertyDescriptor(
    Node.prototype,
    'parentNode'
)!.get!;

const parentElementGetter: (this: Node) => Element | null = hasOwnProperty.call(
    Node.prototype,
    'parentElement'
)
    ? getOwnPropertyDescriptor(Node.prototype, 'parentElement')!.get!
    : getOwnPropertyDescriptor(HTMLElement.prototype, 'parentElement')!.get!; // IE11

export {
    // Node.prototype
    parentElementGetter,
    parentNodeGetter,
};
