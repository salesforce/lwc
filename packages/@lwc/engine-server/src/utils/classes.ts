/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const CLASSNAMES_SEPARATOR = /\s+/g;

export function classNameToTokenList(value: string): Set<string> {
    return new Set(value.split(CLASSNAMES_SEPARATOR).filter((str) => str.length));
}

export function tokenListToClassName(values: Set<string>): string {
    return Array.from(values).join(' ');
}
