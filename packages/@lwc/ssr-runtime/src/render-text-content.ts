/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Given an object, render it for use as a text content node.
 * @param value
 */
export function renderTextContent(value: any): string {
    // Using non strict equality to align with original implementation (ex. undefined == null)
    // See: https://github.com/salesforce/lwc/blob/348130f/packages/%40lwc/engine-core/src/framework/api.ts#L548
    return value == null ? '' : String(value);
}
