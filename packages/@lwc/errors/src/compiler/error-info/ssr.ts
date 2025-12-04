/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DiagnosticLevel, type LWCErrorInfo } from '../../shared/types';

/*
 * For the next available error code, reference (and update!) the value in ./index.ts
 */

export const SsrCompilerErrors = {
    RESERVED_IDENTIFIER_PREFIX: {
        code: 1202,
        message: 'Identifier name cannot start with "__lwc".',
        level: DiagnosticLevel.Error,
        url: '',
    },
} as const satisfies Record<string, LWCErrorInfo>;
