/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export interface Location {
    /** 0-base character index in the file */
    start: number;

    /** Number of character after the start index */
    length: number;

    line?: number;
    column?: number;
}
