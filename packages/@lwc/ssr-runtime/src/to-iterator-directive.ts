/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Converts an iterable into one that emits the object used by the [`iterator` directive](
 * https://lwc.dev/guide/html_templates#iterator).
 */
export function* toIteratorDirective<T>(iterable: Iterable<T>): Generator<{
    value: T;
    index: number;
    first: boolean;
    last: boolean;
}> {
    if (iterable === undefined || iterable === null) return;
    if (!iterable[Symbol.iterator]) {
        throw new Error(
            // Mimic error message from "[i]terable node" in engine-core's api.ts
            `Invalid template iteration for value \`${iterable}\`. It must be an array-like object.`
        );
    }
    const iterator = iterable[Symbol.iterator]();
    let next = iterator.next();
    let index = 0;
    let { value, done: last = false } = next;

    while (last === false) {
        // using a look-back approach because we need to know if the element is the last
        next = iterator.next();
        last = next.done ?? false;

        yield {
            value,
            index,
            first: index === 0,
            last,
        };

        index += 1;
        value = next.value;
    }
}
