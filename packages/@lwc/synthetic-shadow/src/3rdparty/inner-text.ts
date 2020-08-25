/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayPush } from '@lwc/shared';
import { innerTextGetter } from '../env/element';
import { ELEMENT_NODE, TEXT_NODE } from '../env/node';
import { windowGetComputedStyle, windowGetSelection } from '../env/window';
import { childNodesGetterPatched } from '../faux-shadow/node';
import { getOwnerWindow } from '../shared/utils';
import { getTextContent } from './polymer/text-content';

type InnerTextItem = string | number;

interface SelectionState {
    element: Element;
    onselect: ((this: GlobalEventHandlers, ev: Event) => any) | null;
    onselectionchange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
    onselectstart: ((this: GlobalEventHandlers, ev: Event) => any) | null;
    ranges: Range[];
}

function getElementComputedStyle(element: Element): CSSStyleDeclaration {
    const win = getOwnerWindow(element);

    return windowGetComputedStyle.call(win, element);
}

function getWindowSelection(node: Node): Selection | null {
    const win = getOwnerWindow(node);

    return windowGetSelection.call(win);
}

function nodeIsBeingRendered(nodeComputedStyle: CSSStyleDeclaration): boolean {
    return nodeComputedStyle.visibility === 'visible' && nodeComputedStyle.display !== 'none';
}

function getSelectionState(element: Element): SelectionState | null {
    const win = getOwnerWindow(element);
    const selection = getWindowSelection(element);

    if (selection === null) {
        return null;
    }

    const ranges: Range[] = [];
    for (let i = 0; i < selection.rangeCount; i++) {
        ranges.push(selection.getRangeAt(i));
    }

    const state: SelectionState = {
        element,
        onselect: win.onselect,
        onselectstart: win.onselectstart,
        onselectionchange: win.onselectionchange,
        ranges,
    };

    win.onselect = null;
    win.onselectstart = null;
    win.onselectionchange = null;

    return state;
}

function restoreSelectionState(state: SelectionState | null): void {
    if (state === null) {
        return;
    }

    const { element, onselect, onselectstart, onselectionchange, ranges } = state;

    const win = getOwnerWindow(element);
    const selection = getWindowSelection(element)!;

    selection.removeAllRanges();
    for (let i = 0; i < ranges.length; i++) {
        selection.addRange(ranges[i]);
    }

    win.onselect = onselect;
    win.onselectstart = onselectstart;
    win.onselectionchange = onselectionchange;
}

/**
 * Gets the "innerText" of a text node using the Selection API
 *
 * NOTE: For performance reasons, since this function will be called multiple times while calculating the innerText of
 *       an element, it does not restore the current selection.
 * @param textNode
 */
function getTextNodeInnerText(textNode: Text): string {
    const selection = getWindowSelection(textNode);

    if (selection === null) {
        return textNode.textContent || '';
    }

    const range = document.createRange();
    range.selectNodeContents(textNode);
    const domRect = range.getBoundingClientRect();

    if (domRect.height <= 0 || domRect.width <= 0) {
        // the text node is not rendered
        return '';
    }

    // Needed to remove non rendered characters from the text node.
    selection.removeAllRanges();
    selection.addRange(range);

    return selection.toString();
}

const nodeIsElement = (node: Node): node is Element => node.nodeType === ELEMENT_NODE;
const nodeIsText = (node: Node): node is Text => node.nodeType === TEXT_NODE;

/**
 * Spec: https://html.spec.whatwg.org/multipage/dom.html#inner-text-collection-steps
 * One spec implementation: https://github.com/servo/servo/blob/721271dcd3c20db5ca8cf146e2b5907647afb4d6/components/layout/query.rs#L1132
 * @param node
 */
function innerTextCollectionSteps(node: Node): InnerTextItem[] {
    const items: InnerTextItem[] = [];

    if (nodeIsElement(node)) {
        const { tagName } = node;
        const computedStyle = getElementComputedStyle(node);

        if (tagName === 'OPTION') {
            // For options, is hard to get the "rendered" text, let's use the original getter.
            return [1, innerTextGetter!.call(node), 1];
        } else if (tagName === 'TEXTAREA') {
            return [];
        } else {
            const childNodes = childNodesGetterPatched.call(node);
            for (let i = 0, n = childNodes.length; i < n; i++) {
                ArrayPush.apply(items, innerTextCollectionSteps(childNodes[i]));
            }
        }

        if (!nodeIsBeingRendered(computedStyle)) {
            if (tagName === 'SELECT' || tagName === 'DATALIST') {
                // the select is either: .visibility != 'visible' or .display === hidden, therefore this select should
                // not display any value.
                return [];
            }

            return items;
        }

        if (tagName === 'BR') {
            items.push('\u{000A}' /* line feed */);
        }

        const { display } = computedStyle;

        if (display === 'table-cell') {
            // omitting case: and node's CSS box is not the last 'table-cell' box of its enclosing 'table-row' box
            items.push('\u{0009}' /* tab */);
        }

        if (display === 'table-row') {
            // omitting case: and node's CSS box is not the last 'table-row' box of the nearest ancestor 'table' box
            items.push('\u{000A}' /* line feed */);
        }

        if (tagName === 'P') {
            items.unshift(2);
            items.push(2);
        }

        if (
            display === 'block' ||
            display === 'table-caption' ||
            display === 'flex' ||
            display === 'table'
        ) {
            items.unshift(1);
            items.push(1);
        }
    } else if (nodeIsText(node)) {
        items.push(getTextNodeInnerText(node));
    }

    return items;
}

/**
 * InnerText getter spec: https://html.spec.whatwg.org/multipage/dom.html#the-innertext-idl-attribute
 *
 * One spec implementation: https://github.com/servo/servo/blob/721271dcd3c20db5ca8cf146e2b5907647afb4d6/components/layout/query.rs#L1087
 */
export function getInnerText(element: Element): string {
    const thisComputedStyle = getElementComputedStyle(element);

    if (!nodeIsBeingRendered(thisComputedStyle)) {
        return getTextContent(element) || '';
    }

    const selectionState = getSelectionState(element);
    const results: InnerTextItem[] = [];
    const childNodes = childNodesGetterPatched.call(element);

    for (let i = 0, n = childNodes.length; i < n; i++) {
        ArrayPush.apply(results, innerTextCollectionSteps(childNodes[i]));
    }

    restoreSelectionState(selectionState);

    let elementInnerText = '';
    let maxReqLineBreakCount = 0;
    for (let i = 0, n = results.length; i < n; i++) {
        const item = results[i];

        if (typeof item === 'string') {
            if (maxReqLineBreakCount > 0) {
                for (let j = 0; j < maxReqLineBreakCount; j++) {
                    elementInnerText += '\u{000A}';
                }

                maxReqLineBreakCount = 0;
            }

            if (item.length > 0) {
                elementInnerText += item;
            }
        } else {
            if (elementInnerText.length == 0) {
                // Remove required line break count at the start.
                continue;
            }
            // Store the count if it's the max of this run,
            // but it may be ignored if no text item is found afterwards,
            // which means that these are consecutive line breaks at the end.
            if (item > maxReqLineBreakCount) {
                maxReqLineBreakCount = item;
            }
        }
    }

    return elementInnerText;
}
