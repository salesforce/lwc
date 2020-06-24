import { DiagnosticSeverity } from '@scary/diagnostics/';
import { DiagnosticLevel } from './types';

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const templateRegex = /\{([0-9]+)\}/g;
export function templateString(template: string, args: any[]) {
    return template.replace(templateRegex, (_, index) => {
        return args[index];
    });
}

export function severityToLevel(severity?: DiagnosticSeverity): DiagnosticLevel {
    if (!severity) return DiagnosticLevel.Log;

    switch (severity) {
        case DiagnosticSeverity.Info:
            return DiagnosticLevel.Log;
        case DiagnosticSeverity.Warning:
            return DiagnosticLevel.Warning;
        case DiagnosticSeverity.Error:
            return DiagnosticLevel.Error;
        case DiagnosticSeverity.Fatal:
            return DiagnosticLevel.Fatal;
        default:
            return DiagnosticLevel.Log;
    }
}
