/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, isTrue } from '@lwc/shared';
import { ownerDocumentGetter } from '../env/node';
import { defaultViewGetter } from '../env/document';
import { getAttribute } from '../env/element';

// Helpful for tests running with jsdom
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

// TODO [#1222]: remove global bypass
export function isGlobalPatchingSkipped(node: Node): boolean {
    // we lazily compute this value instead of doing it during evaluation, this helps
    // for apps that are setting this after the engine code is evaluated.
    if (isUndefined(skipGlobalPatching)) {
        const ownerDocument = getOwnerDocument(node);
        skipGlobalPatching =
            ownerDocument.body &&
            getAttribute.call(ownerDocument.body, 'data-global-patching-bypass') ===
                'temporary-bypass';
    }
    return isTrue(skipGlobalPatching);
}

/**
 * This utility should be used to convert NodeList and HTMLCollection into an array before we
 * perform array operations on them. See issue #1545 for more details.
 */
export function arrayFromCollection<T extends Node, K extends Element>(
    collection: NodeListOf<T> | HTMLCollectionOf<K>
): Array<T | K> {
    const size = collection.length;
    const cloned: T[] | K[] = [];
    if (size > 0) {
        for (let i = 0; i < size; i++) {
            cloned[i] = collection[i];
        }
    }
    return cloned;
}
