/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const CLASSNAMES_SEPARATOR = /\s+/g;

/**
 * Splits the given space-delimited string into unique values.
 * @param value The string to split
 * @returns Set of unique values
 * @example classNametoTokenList('foo  bar foo') // Set(2) { 'foo', 'bar' }
 */
export function classNameToTokenList(value: string): Set<string> {
    return new Set(value.split(CLASSNAMES_SEPARATOR).filter((str) => str.length));
}

/**
 * Converts a set of values into a space-delimited string
 * @param values The set of values to join
 * @returns A space-delimited string
 * @example tokenListToClassName(new Set(['hello', 'world'])) // 'hello world'
 */
export function tokenListToClassName(values: Set<string>): string {
    return Array.from(values).join(' ');
}
