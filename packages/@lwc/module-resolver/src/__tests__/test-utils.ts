/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as path from 'path';

export const LWC_CONFIG_ERROR_CODE = 'LWC_CONFIG_ERROR';
export const NO_LWC_MODULE_FOUND_CODE = 'NO_LWC_MODULE_FOUND';

export function fixture(relPath: string): string {
    return path.resolve(__dirname, 'fixtures', relPath);
}
