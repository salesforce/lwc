import { getOwnPropertyDescriptor } from '../shared/language';

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const { querySelectorAll, getAttribute, setAttribute } = Element.prototype;

const childElementCountGetter: (this: ParentNode) => number = getOwnPropertyDescriptor(
    Element.prototype,
    'childElementCount'
)!.get!;

export { querySelectorAll, getAttribute, setAttribute, childElementCountGetter };
