/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayJoin, ArrayPush, isNull, StringToLowerCase } from './language';
import { tagNameGetter } from '../env/element';
import { parentNodeGetter } from '../env/node';
import { ShadowRootHostGetter } from '../env/dom';

function isLWC(element): element is HTMLElement {
    return element instanceof Element && tagNameGetter.call(element).indexOf('-') !== -1;
}

function isShadowRoot(elmOrShadow: Node | ShadowRoot): elmOrShadow is ShadowRoot {
    return !(elmOrShadow instanceof Element) && 'host' in elmOrShadow;
}

function getFormattedComponentStack(elm: Element): string {
    const componentStack: string[] = [];
    const indentationChar = '\t';
    let indentation = '';

    let currentElement: Node | null = elm;

    do {
        if (isLWC(currentElement)) {
            ArrayPush.call(
                componentStack,
                `${indentation}<${StringToLowerCase.call(tagNameGetter.call(currentElement))}>`
            );

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
            /* eslint-disable-next-line no-console */
            console.error(msg);
            return;
        }
        try {
            throw new Error(msg);
        } catch (e) {
            /* eslint-disable-next-line no-console */
            console.error(e);
        }
    },
};

export default assert;
