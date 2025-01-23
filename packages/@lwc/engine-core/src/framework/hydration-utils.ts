/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayPush, ArrayJoin, ArraySort, ArrayFrom, isNull, isUndefined } from '@lwc/shared/language';

import { assertNotProd } from './utils';

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

/*
    Prints attributes as null or "value"
*/
export function prettyPrintAttribute(attribute: string, value: any): string {
    assertNotProd(); // this method should never leak to prod
    return `${attribute}=${isNull(value) || isUndefined(value) ? value : `"${value}"`}`;
}

/*
    Sorts and stringifies classes
*/
export function prettyPrintClasses(classes: Classes) {
    assertNotProd(); // this method should never leak to prod
    const value = JSON.stringify(ArrayJoin.call(ArraySort.call(ArrayFrom(classes)), ' '));
    return `class=${value}`;
}

/*
    Hydration errors occur before the source node has been fully hydrated,
    queue them so they can be logged later against the mounted node.
*/
export function queueHydrationError(type: string, serverRendered?: any, clientExpected?: any) {
    assertNotProd(); // this method should never leak to prod
    ArrayPush.call(hydrationErrors, { type, serverRendered, clientExpected });
}

/*
    Flushes (logs) any queued errors after the source node has been mounted.
 */
export function flushHydrationErrors(source?: Node | null) {
    assertNotProd(); // this method should never leak to prod
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
    if (process.env.NODE_ENV !== 'production' && !isCorrectType) {
        queueHydrationError('node', node);
    }
    return isCorrectType;
}

export function isTypeText(node?: Node): node is Text {
    const isCorrectType = node?.nodeType === EnvNodeTypes.TEXT;
    if (process.env.NODE_ENV !== 'production' && !isCorrectType) {
        queueHydrationError('node', node);
    }
    return isCorrectType;
}

export function isTypeComment(node?: Node): node is Comment {
    const isCorrectType = node?.nodeType === EnvNodeTypes.COMMENT;
    if (process.env.NODE_ENV !== 'production' && !isCorrectType) {
        queueHydrationError('node', node);
    }
    return isCorrectType;
}

/*
    logger.ts converts all args to a string, losing object referenences and has
    legacy bloat which would have meant more pathing.
*/
export function logHydrationWarning(...args: any) {
    assertNotProd(); // this method should never leak to prod
    /* eslint-disable-next-line no-console */
    console.warn('[LWC warn:', ...args);
}
