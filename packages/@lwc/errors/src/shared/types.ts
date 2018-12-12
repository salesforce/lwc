/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export enum DiagnosticLevel {
    /** Unexpected error, parsing error, bundling error */
    Fatal = 0,
    /** Linting error with error level, invalid external reference, invalid import, invalid transform */
    Error = 1,
    /** Linting error with warning level, usage of an API to be deprecated */
    Warning = 2,
    /** Logging messages */
    Log = 3,
}

export interface LWCErrorInfo {
    code: number;
    message: string;
    level: DiagnosticLevel;
    url?: string;
}

export interface Location {
    line: number;
    column: number;
    start?: number;
    length?: number;
}
