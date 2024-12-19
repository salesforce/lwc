/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { generateErrorMessage, type LWCErrorInfo } from '@lwc/errors';

// This type extracts the arguments in a string. Example: "Error {0} {1}" -> [string, string]
type ExtractArguments<T extends string> = T extends `${string}{${number}}${infer R}`
    ? [string, ...ExtractArguments<R>]
    : [];

export function generateError<const T extends LWCErrorInfo>(
    error: T,
    ...args: ExtractArguments<T['message']>
): Error {
    return new Error(generateErrorMessage(error, args));
}
