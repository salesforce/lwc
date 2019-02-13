/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayJoin, ArrayPush, forEach, isNull, StringToLowerCase } from "./language";
import { tagNameGetter } from "../env/element";
import { parentNodeGetter } from "../env/node";
import { ShadowRootHostGetter } from "../env/dom";

const StringSplit = String.prototype.split;

function isLWC(element): element is HTMLElement {
    return (element instanceof Element) && (tagNameGetter.call(element).indexOf('-') !== -1);
}

function isShadowRoot(elmOrShadow: Node | ShadowRoot): elmOrShadow is ShadowRoot {
    return !(elmOrShadow instanceof Element) && ('host' in elmOrShadow);
}

function getFormattedComponentStack(elm: Element): string {
    const componentStack: string[] = [];
    const indentationChar = '\t';
    let indentation = '';

    let currentElement: Node | null = elm;

    do {
        if (isLWC(currentElement)) {
            ArrayPush.call(componentStack, `${indentation}<${StringToLowerCase.call(tagNameGetter.call(currentElement))}>`);

            indentation = indentation + indentationChar;
        }

        if (isShadowRoot(currentElement)) {
            // if at some point we find a ShadowRoot, it must be a native shadow root.
            currentElement = ShadowRootHostGetter.call(currentElement);
        } else {
            currentElement = parentNodeGetter.call(currentElement);
        }
    } while (!isNull(currentElement));

    return ArrayJoin.call(componentStack, '\n');
}

const assert = {
    invariant(value: any, msg: string) {
        if (!value) {
            throw new Error(`Invariant Violation: ${msg}`);
        }
    },
    isTrue(value: any, msg: string) {
        if (!value) {
            throw new Error(`Assert Violation: ${msg}`);
        }
    },
    isFalse(value: any, msg: string) {
        if (value) {
            throw new Error(`Assert Violation: ${msg}`);
        }
    },
    fail(msg: string) {
        throw new Error(msg);
    },
    logError(message: string, elm?: Element) {
        let msg = `[LWC error]: ${message}`;

        if (elm) {
            msg = `${msg}\n${getFormattedComponentStack(elm)}`;
        }

        if (process.env.NODE_ENV === 'test') {
            console.error(msg); // tslint:disable-line
            return;
        }
        try {
            throw new Error(msg);
        } catch (e) {
            console.error(e); // tslint:disable-line
        }
    },
    logWarning(message: string, elm?: Element) {
        let msg = `[LWC warning]: ${message}`;

        if (elm) {
            msg = `${msg}\n${getFormattedComponentStack(elm)}`;
        }

        if (process.env.NODE_ENV === 'test') {
            console.warn(msg); // tslint:disable-line
            return;
        }
        try {
            throw new Error('error to get stacktrace');
        } catch (e) {
            // first line is the dummy message and second this function (which does not need to be there)
            // Typescript is inferring the wrong function type for this particular
            // overloaded method: https://github.com/Microsoft/TypeScript/issues/27972
            // @ts-ignore type-mismatch
            const stackTraceLines: string[] = StringSplit.call(e.stack, '\n').splice(2);
            console.group(msg); // tslint:disable-line
            forEach.call(stackTraceLines, (trace) => {
                // We need to format this as a string,
                // because Safari will detect that the string
                // is a stack trace line item and will format it as so
                console.log('%s', trace.trim()); // tslint:disable-line
            });
            console.groupEnd(); // tslint:disable-line
        }
    },
};

export default assert;
