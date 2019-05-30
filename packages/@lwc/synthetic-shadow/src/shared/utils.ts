/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { ownerDocumentGetter } from '../env/node';
import { defaultViewGetter } from '../env/document';
import { isUndefined, isTrue } from './language';

export function getOwnerDocument(node: Node): Document {
    const doc = ownerDocumentGetter.call(node);
    // if doc is null, it means `this` is actually a document instance
    return doc === null ? (node as Document) : doc;
}

export function getOwnerWindow(node: Node): Window {
    const doc = getOwnerDocument(node);
    const win = defaultViewGetter.call(doc);
    if (win === null) {
        // this method should never be called with a node that is not part
        // of a qualifying connected node.
        throw new TypeError();
    }
    return win;
}

let skipGlobalPatching: boolean;

export function isGlobalPatchingSkipped(node: Node): boolean {
    // we lazily compute this value instead of doing it during evaluation, this helps
    // for apps that are setting this after the engine code is evaluated.
    if (isUndefined(skipGlobalPatching)) {
        const ownerDocument = getOwnerDocument(node);
        skipGlobalPatching =
            ownerDocument.body.getAttribute('data-global-patching-bypass') === 'temporary-bypass';
    }
    return isTrue(skipGlobalPatching);
}
