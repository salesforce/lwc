/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { LWCErrorInfo } from '../shared/types';
import type { ErrorConfig } from './errors';

/**
 * Pattern modeled after @lwc/engine-core's reporting.ts system
 */
export const CompilerMetrics = {
    LWCDynamicDirective: 'lwc-dynamic-directive',
    LWCRenderModeDirective: 'lwc-render-mode-directive',
    LWCSpreadDirective: 'lwc-spread-directive',
    DynamicImportTransform: 'dynamic-import-transform',
} as const;

export type CompilerMetrics = (typeof CompilerMetrics)[keyof typeof CompilerMetrics];

export interface InstrumentationObject {
    log: (errorInfo: LWCErrorInfo, config: ErrorConfig) => void;
    incrementCounter: (metric: CompilerMetrics) => void;
}
