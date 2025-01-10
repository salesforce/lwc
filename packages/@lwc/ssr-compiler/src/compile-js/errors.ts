/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { type LWCErrorInfo, generateCompilerError } from '@lwc/errors';
import type { BaseNodeWithoutComments } from 'estree';

// This type extracts the arguments in a string. Example: "Error {0} {1}" -> [string, string]
type ExtractArguments<
    T extends string,
    Numbers extends number = never,
    Args extends string[] = [],
> = T extends `${string}{${infer N extends number}}${infer R}`
    ? N extends Numbers // Is `N` in the union of seen numbers?
        ? ExtractArguments<R, Numbers, Args> // new `N`, add an argument
        : ExtractArguments<R, N | Numbers, [string, ...Args]> // `N` already accounted for
    : Args; // No `N` found, nothing more to check

export function generateError<const T extends LWCErrorInfo>(
    node: BaseNodeWithoutComments,
    error: T,
    ...messageArgs: ExtractArguments<T['message']>
) {
    return generateCompilerError(error, {
        messageArgs,
        origin: node.loc
            ? {
                  filename: node.loc.source || undefined,
                  location: {
                      line: node.loc.start.line,
                      column: node.loc.start.column,
                      ...(node.range
                          ? { start: node.range[0], length: node.range[1] - node.range[0] }
                          : {}),
                  },
              }
            : undefined,
    });
}
