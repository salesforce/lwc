/**
@license
Copyright (c) 2015 Simon Friis Vindum.
This code may only be used under the MIT License found at
https://github.com/snabbdom/snabbdom/blob/master/LICENSE
Code distributed by Snabbdom as part of the Snabbdom project at
https://github.com/snabbdom/snabbdom/
*/

/* tslint:disable:one-variable-per-declaration*/

import { VNode, VNodes, Key } from './types';

function isUndef(s: any): s is undefined {
    return s === undefined;
}

interface KeyToIndexMap {
    [key: string]: number;
}

function sameVnode(vnode1: VNode, vnode2: VNode): boolean {
    return (
        vnode1.key === vnode2.key &&
        vnode1.sel === vnode2.sel
    );
}

function isVNode(vnode: any): vnode is VNode {
    return vnode != null;
}

function createKeyToOldIdx(
    children: VNodes,
    beginIdx: number,
    endIdx: number,
): KeyToIndexMap {
    const map: KeyToIndexMap = {};
    let j: number, key: Key | undefined, ch;
    // TODO: simplify this by assuming that all vnodes has keys
    for (j = beginIdx; j <= endIdx; ++j) {
        ch = children[j];
        if (isVNode(ch)) {
            key = ch.key;
            if (key !== undefined) {
                map[key] = j;
            }
        }
    }
    return map;
}

function addVnodes(
    parentElm: Node,
    before: Node | null,
    vnodes: VNodes,
    startIdx: number,
    endIdx: number
) {
    for (; startIdx <= endIdx; ++startIdx) {
        const ch = vnodes[startIdx];
        if (isVNode(ch)) {
            ch.hook.create(ch);
            ch.hook.insert(
                ch,
                parentElm,
                before,
            );
        }
    }
}

function removeVnodes(
    parentElm: Node,
    vnodes: VNodes,
    startIdx: number,
    endIdx: number,
): void {
    for (; startIdx <= endIdx; ++startIdx) {
        const ch = vnodes[startIdx];
        // text nodes do not have logic associated to them
        if (isVNode(ch)) {
            ch.hook.remove(ch, parentElm);
        }
    }
}

export function updateDynamicChildren(
    parentElm: Node,
    oldCh: VNodes,
    newCh: VNodes
) {
    let oldStartIdx = 0;
    let newStartIdx = 0;
    let oldEndIdx = oldCh.length - 1;
    let oldStartVnode = oldCh[0];
    let oldEndVnode = oldCh[oldEndIdx];
    let newEndIdx = newCh.length - 1;
    let newStartVnode = newCh[0];
    let newEndVnode = newCh[newEndIdx];
    let oldKeyToIdx: any;
    let idxInOld: number;
    let elmToMove: VNode | null | undefined;
    let before: any;
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (!isVNode(oldStartVnode)) {
            oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
        } else if (!isVNode(oldEndVnode)) {
            oldEndVnode = oldCh[--oldEndIdx];
        } else if (!isVNode(newStartVnode)) {
            newStartVnode = newCh[++newStartIdx];
        } else if (!isVNode(newEndVnode)) {
            newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldStartVnode, newStartVnode)) {
            patchVnode(oldStartVnode, newStartVnode);
            oldStartVnode = oldCh[++oldStartIdx];
            newStartVnode = newCh[++newStartIdx];
        } else if (sameVnode(oldEndVnode, newEndVnode)) {
            patchVnode(oldEndVnode, newEndVnode);
            oldEndVnode = oldCh[--oldEndIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldStartVnode, newEndVnode)) {
            // Vnode moved right
            patchVnode(oldStartVnode, newEndVnode);
            newEndVnode.hook.insert(
                oldStartVnode,
                parentElm,
                // TODO: resolve this, but using dot notation for nextSibling for now
                (oldEndVnode.elm as Node).nextSibling,
            );
            oldStartVnode = oldCh[++oldStartIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldEndVnode, newStartVnode)) {
            // Vnode moved left
            patchVnode(oldEndVnode, newStartVnode);
            newStartVnode.hook.insert(
                oldEndVnode,
                parentElm,
                oldStartVnode.elm as Node,
            );
            oldEndVnode = oldCh[--oldEndIdx];
            newStartVnode = newCh[++newStartIdx];
        } else {
            if (oldKeyToIdx === undefined) {
                oldKeyToIdx = createKeyToOldIdx(
                    oldCh,
                    oldStartIdx,
                    oldEndIdx,
                );
            }
            idxInOld = oldKeyToIdx[newStartVnode.key as string];
            if (isUndef(idxInOld)) {
                // New element
                newStartVnode.hook.create(newStartVnode);
                newStartVnode.hook.insert(
                    newStartVnode,
                    parentElm,
                    oldStartVnode.elm as Node,
                );
                newStartVnode = newCh[++newStartIdx];
            } else {
                elmToMove = oldCh[idxInOld];
                if (isVNode(elmToMove)) {
                    if (elmToMove.sel !== newStartVnode.sel) {
                        // New element
                        newStartVnode.hook.create(newStartVnode);
                        newStartVnode.hook.insert(
                            newStartVnode,
                            parentElm,
                            oldStartVnode.elm as Node,
                        );
                    } else {
                        patchVnode(
                            elmToMove,
                            newStartVnode,
                        );
                        oldCh[idxInOld] = undefined as any;
                        newStartVnode.hook.insert(
                            elmToMove,
                            parentElm,
                            oldStartVnode.elm as Node,
                        );
                    }
                }
                newStartVnode = newCh[++newStartIdx];
            }
        }
    }
    if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
        if (oldStartIdx > oldEndIdx) {
            const n = newCh[newEndIdx + 1];
            before = isVNode(n) ? n.elm : null;
            addVnodes(
                parentElm,
                before,
                newCh,
                newStartIdx,
                newEndIdx,
            );
        } else {
            removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
        }
    }
}

export function updateStaticChildren(
    parentElm: Node,
    oldCh: VNodes,
    newCh: VNodes
) {
    const { length } = newCh;
    if (oldCh.length === 0) {
        // the old list is empty, we can directly insert anything new
        addVnodes(
            parentElm,
            null,
            newCh,
            0,
            length,
        );
        return;
    }
    // if the old list is not empty, the new list MUST have the same
    // amount of nodes, that's why we call this static children
    let referenceElm: Node | null = null;
    for (let i = length - 1; i >= 0; i -= 1) {
        const vnode = newCh[i];
        const oldVNode = oldCh[i];
        if (vnode !== oldVNode) {
            if (isVNode(oldVNode)) {
                if (isVNode(vnode)) {
                    // both vnodes must be equivalent, and se just need to patch them
                    patchVnode(oldVNode, vnode);
                    referenceElm = vnode.elm as Node;
                } else {
                    // removing the old vnode since the new one is null
                    oldVNode.hook.remove(oldVNode, parentElm);
                }
            } else if (isVNode(vnode)) { // this condition is unnecessary
                vnode.hook.create((vnode as VNode));
                // insert the new node one since the old one is null
                vnode.hook.insert(
                    vnode,
                    parentElm,
                    referenceElm,
                );
                referenceElm = (vnode as VNode).elm as Node;
            }
        }
    }
}

function patchVnode(oldVnode: VNode, vnode: VNode) {
    if (oldVnode !== vnode) {
        vnode.elm = oldVnode.elm;
        vnode.hook.update(oldVnode, vnode);
    }
}
