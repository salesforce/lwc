/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export function child(node: ParentNode): Node {
    return node.firstChild!;
}

export function nthChild(node: Node, i: number): Node {
    // Fast path for the two indices that dominate the per-row mount hot path
    // (krausest row body emits `nthChild(n,0)` and `nthChild(n,1)`): read the
    // sibling pointers directly instead of `node.childNodes[i]`, which
    // materializes a live NodeList before indexing. `firstChild`/`nextSibling`
    // are semantically identical (both walk all node types) but are plain
    // pointer reads — ~7-9% faster create-1k / append-1k in matched @best A/B.
    // Higher indices (the once-per-render deep header walk) keep the NodeList
    // index so they never degrade into a long `nextSibling` chain.
    if (i === 0) {
        return node.firstChild!;
    }
    if (i === 1) {
        return node.firstChild!.nextSibling!;
    }
    return node.childNodes[i];
}

export function next(node: Node): Node {
    return node.nextSibling!;
}

export function createTextNode(value = ''): Text {
    return document.createTextNode(value);
}

export function createComment(data: string): Comment {
    return document.createComment(data);
}
