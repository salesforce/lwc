/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LWCErrorInfo } from '../shared/types';
import { ErrorConfig } from './errors';

/**
 * Pattern modeled after @lwc/engine-core's reporting.ts system
 */
export enum CompilerMetrics {
    LWCDynamicDirective = 'lwc-dynamic-directive',
    LWCRenderModeDirective = 'lwc-render-mode-directive',
    LWCSpreadDirective = 'lwc-spread-directive',
    DynamicImportTransform = 'dynamic-import-transform',
}

export interface InstrumentationObject {
    log: (errorInfo: LWCErrorInfo, config: ErrorConfig) => void;
    incrementCounter: (metric: CompilerMetrics) => void;
}
