/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { CompilerMetrics, LWCClassErrors } from '@lwc/errors';
import { handleError, incrementMetricCounter } from './utils';
import { injectNamedImport } from './import-helpers';
import type { Program, CallExpression, Expression, Identifier, Span } from '@swc/types';
import type { VisitorState } from './utils';
import type { LwcSwcPluginOptions } from './types';

const DUMMY_SPAN: Span = { start: 0, end: 0, ctxt: 0 };

function makeIdentifier(value: string): Identifier {
    return { type: 'Identifier', value, optional: false, span: DUMMY_SPAN, ctxt: 0 } as any;
}

/**
 * Checks if a CallExpression is a dynamic import() call.
 */
export function isDynamicImport(node: CallExpression): boolean {
    return node.callee.type === 'Import';
}

/**
 * Processes a dynamic import() CallExpression node.
 * Returns the replacement Expression or the original if no transformation needed.
 */
export function processDynamicImport(
    program: Program,
    node: CallExpression,
    state: VisitorState,
    dynamicImportState: DynamicImportState
): Expression {
    const dynamicImports = state.opts?.dynamicImports;
    if (!dynamicImports) {
        return node;
    }

    const { loader, strictSpecifier } = dynamicImports;
    const sourceArg = node.arguments[0]?.expression;

    if (strictSpecifier) {
        if (!sourceArg || sourceArg.type !== 'StringLiteral') {
            handleError(
                node,
                {
                    errorInfo: LWCClassErrors.INVALID_DYNAMIC_IMPORT_SOURCE_STRICT,
                    messageArgs: [sourceArg ? JSON.stringify(sourceArg) : 'undefined'],
                },
                state
            );
        }
    }

    // Track dynamic import dependency
    if (sourceArg && sourceArg.type === 'StringLiteral') {
        const dep = (sourceArg as any).value as string;
        if (!dynamicImportState.dynamicImports.includes(dep)) {
            dynamicImportState.dynamicImports.push(dep);
        }
    }

    // Replace import() with load() if loader is configured
    if (loader) {
        if (!dynamicImportState.loaderRef) {
            dynamicImportState.loaderRef = injectNamedImport(program, 'load', loader);
        }
        incrementMetricCounter(CompilerMetrics.DynamicImportTransform, state);

        // Replace the import() callee with the loader identifier
        return {
            type: 'CallExpression',
            callee: makeIdentifier(dynamicImportState.loaderRef),
            arguments: node.arguments,
            typeArguments: undefined,
            span: node.span,
            ctxt: 0,
        } as any;
    }

    return node;
}

/**
 * State tracked across dynamic import processing.
 */
export interface DynamicImportState {
    loaderRef: string | undefined;
    dynamicImports: string[];
}

export function createDynamicImportState(): DynamicImportState {
    return { loaderRef: undefined, dynamicImports: [] };
}
