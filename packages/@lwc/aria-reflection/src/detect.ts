/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getOwnPropertyDescriptor } from '@lwc/shared';

export function detect(propName: string, prototype: any = Element.prototype): boolean {
    return getOwnPropertyDescriptor(prototype, propName) === undefined;
}
