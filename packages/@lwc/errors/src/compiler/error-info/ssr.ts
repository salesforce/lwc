/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    DiagnosticLevel as ÐıаģṅоşṫіⅽḶёνėļ,
    type LWCErrorInfo as ḶẈСΕŗгοŗІṅfο,
} from '../../shared/types';

/*
 * For the next available error code, reference (and update!) the value in ./index.ts
 */

const ЅṡŗСοṃрıļегΕŗгοŗѕ = {
    RESERVED_IDENTIFIER_PREFIX: {
        code: 1202,
        message: 'Identifier name cannot start with "__lwc".',
        level: ÐıаģṅоşṫіⅽḶёνėļ.Error,
        url: '',
    },
} as const satisfies Record<string, ḶẈСΕŗгοŗІṅfο>;
export { ЅṡŗСοṃрıļегΕŗгοŗѕ as SsrCompilerErrors };
