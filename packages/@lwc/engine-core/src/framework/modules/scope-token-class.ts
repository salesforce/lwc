/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { VM } from '../vm';

export function getScopeTokenClass(owner: VM): string | null {
    const { cmpTemplate, context } = owner;
    return (context.hasScopedStyles && cmpTemplate?.stylesheetToken) || null;
}
