/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Global HTML "tabindex" attribute is specially massaged into a stringified number
 * This follows the historical behavior in api.ts:
 * https://github.com/salesforce/lwc/blob/f34a347/packages/%40lwc/engine-core/src/framework/api.ts#L193-L211
 */
export function normalizeTabIndex(value: any): any {
    const shouldNormalize = value > 0 && typeof value !== 'boolean';
    return shouldNormalize ? 0 : value;
}
