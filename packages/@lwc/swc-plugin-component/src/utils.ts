/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import lineColumn from 'line-column';
import {
    DiagnosticLevel,
    generateCompilerDiagnostic,
    generateErrorMessage,
    normalizeToCompilerError,
    TransformerErrors,
} from '@lwc/errors';
import type { CompilerDiagnostic, LWCErrorInfo, CompilerMetrics } from '@lwc/errors';
import type { HasSpan } from '@swc/types';
import type { LwcSwcPluginOptions, BindingInfo } from './types';

export type ErrorOptions = {
    errorInfo: LWCErrorInfo;
    messageArgs?: any[];
};

export interface VisitorState {
    code: string;
    filename: string;
    errors: CompilerDiagnostic[];
    errorRecoveryMode: boolean;
    instrumentation?: LwcSwcPluginOptions['instrumentation'];
    opts?: LwcSwcPluginOptions;
    bindingMap?: Map<string, BindingInfo>;
}

/**
 * Normalizes a SWC node span to a location object with line/column/start/length.
 */
export function normalizeLocation(
    code: string,
    span: { start: number; end: number }
): { line: number; column: number; start: number; length: number } | null {
    const lineFinder = lineColumn(code);
    const startPos = lineFinder.fromIndex(span.start);
    if (!startPos) return null;
    return {
        line: startPos.line,
        column: startPos.col - 1, // 0-indexed
        start: span.start,
        length: span.end - span.start,
    };
}

/**
 * Generates an error with location information from an SWC node span.
 */
export function generateError(
    node: HasSpan,
    { errorInfo, messageArgs }: ErrorOptions,
    state: VisitorState
): Error {
    const message = generateErrorMessage(errorInfo, messageArgs);
    const location = normalizeLocation(state.code, node.span);
    const error = new Error(message) as any;
    error.filename = state.filename;
    error.loc = location;
    error.lwcCode = errorInfo?.code;
    return error;
}

/**
 * Collects or throws an error depending on error recovery mode.
 */
export function handleError(node: HasSpan, errorOpts: ErrorOptions, state: VisitorState): void {
    if (state.errorRecoveryMode) {
        collectError(node, errorOpts, state);
    } else {
        throw generateError(node, errorOpts, state);
    }
}

function collectError(
    node: HasSpan,
    { errorInfo, messageArgs }: ErrorOptions,
    state: VisitorState
): void {
    const location = normalizeLocation(state.code, node.span);
    const diagnostic = generateCompilerDiagnostic(
        errorInfo,
        {
            messageArgs,
            origin: {
                filename: state.filename,
                location: location ?? undefined,
            },
        },
        true
    );

    if (diagnostic.level === DiagnosticLevel.Fatal) {
        throw generateError(node, { errorInfo, messageArgs }, state);
    }

    state.errors.push(diagnostic);
}

/**
 * Increments a metric counter via instrumentation if available.
 */
export function incrementMetricCounter(metric: CompilerMetrics, state: VisitorState): void {
    state.instrumentation?.incrementCounter(metric);
}

/**
 * Wraps an SWC transform error with LWC error context.
 */
export function wrapSwcError(e: unknown, filename: string): Error {
    let transformerError: LWCErrorInfo = TransformerErrors.JS_TRANSFORMER_ERROR;

    if (
        e instanceof Error &&
        e.message.includes('Unexpected token') &&
        /\b(track|api|wire)\b/.test(e.message)
    ) {
        transformerError = TransformerErrors.JS_TRANSFORMER_DECORATOR_ERROR;
    }
    return normalizeToCompilerError(transformerError, e, { filename }) as Error;
}
