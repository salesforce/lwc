/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayJoin, ArrayPush, isNull, StringToLowerCase } from './language';
import { tagNameGetter } from '../env/element';

function getFormattedComponentStack(elm: Element): string {
    const componentStack: string[] = [];
    const indentationChar = '\t';
    let indentation = '';

    let currentNode: Node | null = elm;

    // traversing up via getRootNode logic to find the component stack
    do {
        ArrayPush.call(
            componentStack,
            `${indentation}<${StringToLowerCase.call(tagNameGetter.call(currentNode as Element))}>`
        );
        indentation = indentation + indentationChar;
        const newRootNode = currentNode.getRootNode();
        if (newRootNode === currentNode || newRootNode === document) {
            currentNode = null; // quitting
        } else if (newRootNode instanceof ShadowRoot) {
            currentNode = newRootNode.host;
        } else {
            // When the element is part of a tree that is not connected,
            // the root node will be the top element of that tree, e.g.:
            // `<div><p /></div>`, when calling p.getRootNode() it returns
            // the div reference. This branch covers that case.
            currentNode = newRootNode;
        }
    } while (!isNull(currentNode));

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
