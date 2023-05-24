/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LWCErrorInfo } from '../shared/types';

import { CompilerDiagnostic } from './utils';
import { generateCompilerDiagnostic, ErrorConfig } from './errors';

/**
 * Pattern modeled after @lwc/engine-core's reporting.ts system
 */
export const enum CompilerMetrics {
    LWCDynamicDirective = 'lwc-dynamic-directive',
    LWCRenderModeDirective = 'lwc-render-mode-directive',
    LWCSpreadDirective = 'lwc-spread-directive',
    DynamicImportTransform = 'dynamic-import-transform',
}

export interface InstrumentationObject {
    log: (errorInfo: LWCErrorInfo, config: ErrorConfig) => void;
    incrementCounter: (metric: CompilerMetrics) => void;
}

/**
 * Basic Compiler Instrumentation class to gather metrics and diagnostics
 * as properties on itself.
 */
export class CompilerInstrumentation implements InstrumentationObject {
    diagnostics: CompilerDiagnostic[];
    metrics: {
        [key in CompilerMetrics]?: number;
    };

    constructor() {
        this.diagnostics = [];
        this.metrics = {};
    }

    log(errorInfo: LWCErrorInfo, config: ErrorConfig) {
        this.diagnostics.push(generateCompilerDiagnostic(errorInfo, config));
    }

    incrementCounter(metric: CompilerMetrics) {
        this.metrics[metric] = (this.metrics[metric] ?? 0) + 1;
    }
}
