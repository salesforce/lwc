/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayPush, ArrayJoin, ArraySort, ArrayFrom, isNull, isUndefined } from '@lwc/shared';

import { reportHydrationError } from './runtime-instrumentation';

// Errors that occured during the hydration process
let hydrationErrors: Array<HydrationError> = [];

// These values are the ones from Node.nodeType (https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType)
const enum EnvNodeTypes {
    ELEMENT = 1,
    TEXT = 3,
    COMMENT = 8,
}

interface HydrationError {
    type: string;
    serverRendered: any;
    clientExpected: any;
}

export type Classes = Omit<Set<string>, 'add'>;

/**
 * When the framework is running in dev mode, hydration errors will be reported to the console. When
 * running in prod mode, hydration errors will be reported through a global telemetry mechanism, if
 * one is provided. If not provided, error reporting is a no-op.
 */
/* eslint-disable-next-line no-console */
const hydrationLogger = process.env.NODE_ENV === 'production' ? reportHydrationError : console.warn;

/*
    Prints attributes as null or "value"
*/
export function prettyPrintAttribute(attribute: string, value: any): string {
    return `${attribute}=${isNull(value) || isUndefined(value) ? value : `"${value}"`}`;
}

/*
    Sorts and stringifies classes
*/
export function prettyPrintClasses(classes: Classes) {
    const value = JSON.stringify(ArrayJoin.call(ArraySort.call(ArrayFrom(classes)), ' '));
    return `class=${value}`;
}

/*
    Hydration errors occur before the source node has been fully hydrated,
    queue them so they can be logged later against the mounted node.
*/
export function queueHydrationError(type: string, serverRendered?: any, clientExpected?: any) {
    ArrayPush.call(hydrationErrors, { type, serverRendered, clientExpected });
}

/*
    Flushes (logs) any queued errors after the source node has been mounted.
 */
export function flushHydrationErrors(source?: Node | null) {
    for (const hydrationError of hydrationErrors) {
        logHydrationWarning(
            `Hydration ${hydrationError.type} mismatch on:`,
            source,
            `\n- rendered on server:`,
            hydrationError.serverRendered,
            `\n- expected on client:`,
            hydrationError.clientExpected || source
        );
    }
    hydrationErrors = [];
}

export function isTypeElement(node?: Node): node is Element {
    const isCorrectType = node?.nodeType === EnvNodeTypes.ELEMENT;
    if (!isCorrectType) {
        queueHydrationError('node', node);
    }
    return isCorrectType;
}

export function isTypeText(node?: Node): node is Text {
    const isCorrectType = node?.nodeType === EnvNodeTypes.TEXT;
    if (!isCorrectType) {
        queueHydrationError('node', node);
    }
    return isCorrectType;
}

export function isTypeComment(node?: Node): node is Comment {
    const isCorrectType = node?.nodeType === EnvNodeTypes.COMMENT;
    if (!isCorrectType) {
        queueHydrationError('node', node);
    }
    return isCorrectType;
}

/*
    logger.ts converts all args to a string, losing object referenences and has
    legacy bloat which would have meant more pathing.
*/
export function logHydrationWarning(...args: any) {
    hydrationLogger('[LWC warn:', ...args);
}
