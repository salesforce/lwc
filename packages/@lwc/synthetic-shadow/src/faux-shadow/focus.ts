/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayFind,
    ArrayIndexOf,
    ArrayReverse,
    ArraySlice,
    assert,
    createHiddenField,
    getHiddenField,
    setHiddenField,
    isNull,
    isUndefined,
    toString,
} from '@lwc/shared';
import { windowAddEventListener, windowRemoveEventListener } from '../env/window';
import {
    matches,
    querySelectorAll,
    getBoundingClientRect,
    addEventListener,
    removeEventListener,
    tabIndexGetter,
    getAttribute,
} from '../env/element';
import {
    compareDocumentPosition,
    DOCUMENT_POSITION_CONTAINED_BY,
    DOCUMENT_POSITION_PRECEDING,
    DOCUMENT_POSITION_FOLLOWING,
} from '../env/node';
import {
    DocumentPrototypeActiveElement,
    querySelectorAll as documentQuerySelectorAll,
} from '../env/document';
import {
    eventCurrentTargetGetter,
    eventTargetGetter,
    focusEventRelatedTargetGetter,
} from '../env/dom';
import { isDelegatingFocus } from './shadow-root';
import { arrayFromCollection, getOwnerDocument, getOwnerWindow } from '../shared/utils';

const TabbableElementsQuery = `
    button:not([tabindex="-1"]):not([disabled]),
    [contenteditable]:not([tabindex="-1"]),
    video[controls]:not([tabindex="-1"]),
    audio[controls]:not([tabindex="-1"]),
    [href]:not([tabindex="-1"]),
    input:not([tabindex="-1"]):not([disabled]),
    select:not([tabindex="-1"]):not([disabled]),
    textarea:not([tabindex="-1"]):not([disabled]),
    [tabindex="0"]
`;

const DidAddMouseDownListener = createHiddenField<boolean>(
    'DidAddMouseDownListener',
    'synthetic-shadow'
);

function isVisible(element: HTMLElement): boolean {
    const { width, height } = getBoundingClientRect.call(element);
    const noZeroSize = width > 0 || height > 0;
    return noZeroSize && getComputedStyle(element).visibility !== 'hidden';
}

// This function based on https://allyjs.io/data-tables/focusable.html
// It won't catch everything, but should be good enough
// There are a lot of edge cases here that we can't realistically handle
// Determines if a particular element is tabbable, as opposed to simply focusable

function isTabbable(element: HTMLElement): boolean {
    return matches.call(element, TabbableElementsQuery) && isVisible(element);
}

interface QuerySegments {
    prev: HTMLElement[];
    inner: HTMLElement[];
    next: HTMLElement[];
}

function getTabbableSegments(host: HTMLElement): QuerySegments {
    const doc = getOwnerDocument(host);
    const all = arrayFromCollection(documentQuerySelectorAll.call(doc, TabbableElementsQuery));
    const inner = arrayFromCollection(
        querySelectorAll.call(host, TabbableElementsQuery)
    ) as HTMLElement[];
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            getAttribute.call(host, 'tabindex') === '-1' || isDelegatingFocus(host),
            `The focusin event is only relevant when the tabIndex property is -1 on the host.`
        );
    }
    const firstChild = inner[0];
    const lastChild = inner[inner.length - 1];
    const hostIndex = ArrayIndexOf.call(all, host);

    // Host element can show up in our "previous" section if its tabindex is 0
    // We want to filter that out here
    const firstChildIndex = hostIndex > -1 ? hostIndex : ArrayIndexOf.call(all, firstChild);

    // Account for an empty inner list
    const lastChildIndex =
        inner.length === 0 ? firstChildIndex + 1 : ArrayIndexOf.call(all, lastChild) + 1;
    const prev = ArraySlice.call(all, 0, firstChildIndex);
    const next = ArraySlice.call(all, lastChildIndex);
    return {
        prev,
        inner,
        next,
    };
}

export function getActiveElement(host: HTMLElement): Element | null {
    const doc = getOwnerDocument(host);
    const activeElement = DocumentPrototypeActiveElement.call(doc);
    if (isNull(activeElement)) {
        return activeElement;
    }
    // activeElement must be child of the host and owned by it
    return (compareDocumentPosition.call(host, activeElement) & DOCUMENT_POSITION_CONTAINED_BY) !==
        0
        ? activeElement
        : null;
}

function relatedTargetPosition(host: HTMLElement, relatedTarget: EventTarget): number {
    // assert: target must be child of host
    const pos = compareDocumentPosition.call(host, relatedTarget as Node);
    if (pos & DOCUMENT_POSITION_CONTAINED_BY) {
        // focus remains inside the host
        return 0;
    } else if (pos & DOCUMENT_POSITION_PRECEDING) {
        // focus is coming from above
        return 1;
    } else if (pos & DOCUMENT_POSITION_FOLLOWING) {
        // focus is coming from below
        return 2;
    }
    // we don't know what's going on.
    return -1;
}

function muteEvent(event: Event) {
    event.preventDefault();
    event.stopPropagation();
}
function muteFocusEventsDuringExecution(win: Window, func: Function) {
    windowAddEventListener.call(win, 'focusin', muteEvent, true);
    windowAddEventListener.call(win, 'focusout', muteEvent, true);
    func();
    windowRemoveEventListener.call(win, 'focusin', muteEvent, true);
    windowRemoveEventListener.call(win, 'focusout', muteEvent, true);
}

function focusOnNextOrBlur(
    segment: HTMLElement[],
    target: EventTarget,
    relatedTarget: EventTarget
) {
    const win = getOwnerWindow(relatedTarget as Node);
    const next = getNextTabbable(segment, relatedTarget);
    if (isNull(next)) {
        // nothing to focus on, blur to invalidate the operation
        muteFocusEventsDuringExecution(win, () => {
            (target as HTMLElement).blur();
        });
    } else {
        muteFocusEventsDuringExecution(win, () => {
            next.focus();
        });
    }
}

let letBrowserHandleFocus: boolean = false;
export function disableKeyboardFocusNavigationRoutines(): void {
    letBrowserHandleFocus = true;
}
export function enableKeyboardFocusNavigationRoutines(): void {
    letBrowserHandleFocus = false;
}

function skipHostHandler(event: FocusEvent) {
    if (letBrowserHandleFocus) {
        enableKeyboardFocusNavigationRoutines();
        return;
    }

    const host = eventCurrentTargetGetter.call(event);
    const target = eventTargetGetter.call(event);

    // If the host delegating focus with tabindex=0 is not the target, we know
    // that the event was dispatched on a descendant node of the host. This
    // means the focus is coming from below and we don't need to do anything.
    if (host !== target) {
        // Focus is coming from above
        return;
    }

    const relatedTarget = focusEventRelatedTargetGetter.call(event);
    if (isNull(relatedTarget)) {
        // If relatedTarget is null, the user is most likely tabbing into the document from the
        // browser chrome. We could probably deduce whether focus is coming in from the top or the
        // bottom by comparing the position of the target to all tabbable elements. This is an edge
        // case and only comes up if the custom element is the first or last tabbable element in the
        // document.
        return;
    }

    const segments = getTabbableSegments(host as HTMLElement);

    const position = relatedTargetPosition(host as HTMLElement, relatedTarget);
    if (position === 1) {
        // Focus is coming from above
        const findTabbableElms = isTabbableFrom.bind(null, (host as Node).getRootNode());
        const first = ArrayFind.call(segments.inner, findTabbableElms);
        if (!isUndefined(first)) {
            const win = getOwnerWindow(first);
            muteFocusEventsDuringExecution(win, () => {
                first.focus();
            });
        } else {
            focusOnNextOrBlur(segments.next, target, relatedTarget);
        }
    } else if (host === target) {
        // Host is receiving focus from below, either from its shadow or from a sibling
        focusOnNextOrBlur(ArrayReverse.call(segments.prev), target, relatedTarget);
    }
}

function skipShadowHandler(event: FocusEvent) {
    if (letBrowserHandleFocus) {
        enableKeyboardFocusNavigationRoutines();
        return;
    }

    const relatedTarget = focusEventRelatedTargetGetter.call(event);
    if (isNull(relatedTarget)) {
        // If relatedTarget is null, the user is most likely tabbing into the document from the
        // browser chrome. We could probably deduce whether focus is coming in from the top or the
        // bottom by comparing the position of the target to all tabbable elements. This is an edge
        // case and only comes up if the custom element is the first or last tabbable element in the
        // document.
        return;
    }

    const host = eventCurrentTargetGetter.call(event) as HTMLElement;
    const segments = getTabbableSegments(host);

    if (ArrayIndexOf.call(segments.inner, relatedTarget) !== -1) {
        // If relatedTarget is contained by the host's subtree we can assume that the user is
        // tabbing between elements inside of the shadow. Do nothing.
        return;
    }

    const target = eventTargetGetter.call(event) as HTMLElement;

    // Determine where the focus is coming from (Tab or Shift+Tab)
    const position = relatedTargetPosition(host, relatedTarget);
    if (position === 1) {
        // Focus is coming from above
        focusOnNextOrBlur(segments.next, target, relatedTarget);
    }
    if (position === 2) {
        // Focus is coming from below
        focusOnNextOrBlur(ArrayReverse.call(segments.prev), target, relatedTarget);
    }
}

// Use this function to determine whether you can start from one root and end up
// at another element via tabbing.
function isTabbableFrom(fromRoot: Node, toElm: HTMLElement): boolean {
    if (!isTabbable(toElm)) {
        return false;
    }
    const ownerDocument = getOwnerDocument(toElm);
    let root = toElm.getRootNode();
    while (root !== ownerDocument && root !== fromRoot) {
        const sr = root as ShadowRoot;
        const host = sr.host!;
        if (getAttribute.call(host, 'tabindex') === '-1') {
            return false;
        }
        root = host && host.getRootNode();
    }
    return true;
}

function getNextTabbable(tabbables: HTMLElement[], relatedTarget: EventTarget): HTMLElement | null {
    const len = tabbables.length;
    if (len > 0) {
        for (let i = 0; i < len; i += 1) {
            const next = tabbables[i];
            if (isTabbableFrom((relatedTarget as Node).getRootNode(), next)) {
                return next;
            }
        }
    }
    return null;
}

// Skips the host element
export function handleFocus(elm: HTMLElement) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            isDelegatingFocus(elm),
            `Invalid attempt to handle focus event for ${toString(elm)}. ${toString(
                elm
            )} should have delegates focus true, but is not delegating focus`
        );
    }

    bindDocumentMousedownMouseupHandlers(elm);

    // Unbind any focusin listeners we may have going on
    ignoreFocusIn(elm);
    addEventListener.call(elm, 'focusin', skipHostHandler as EventListener, true);
}

export function ignoreFocus(elm: HTMLElement) {
    removeEventListener.call(elm, 'focusin', skipHostHandler as EventListener, true);
}

function bindDocumentMousedownMouseupHandlers(elm: Node) {
    const ownerDocument = getOwnerDocument(elm);
    if (!getHiddenField(ownerDocument, DidAddMouseDownListener)) {
        setHiddenField(ownerDocument, DidAddMouseDownListener, true);
        addEventListener.call(
            ownerDocument,
            'mousedown',
            disableKeyboardFocusNavigationRoutines,
            true
        );

        // Although our sequential focus navigation routines also unset this
        // flag, we need a backup plan in case they don't execute (e.g., the
        // click doesn't result in focus entering the shadow).
        addEventListener.call(
            ownerDocument,
            'mouseup',
            () => {
                // We schedule this as an async task in the mouseup handler (as
                // opposed to the mousedown handler) because we want to guarantee
                // that it will never run before the focusin handler:
                //
                // Click form element   | Click form element label
                // ==================================================
                // mousedown            | mousedown
                // FOCUSIN              | mousedown-setTimeout
                // mousedown-setTimeout | mouseup
                // mouseup              | FOCUSIN
                // mouseup-setTimeout   | mouseup-setTimeout
                setTimeout(enableKeyboardFocusNavigationRoutines);
            },
            true
        );
    }
}

// Skips the shadow tree
export function handleFocusIn(elm: HTMLElement) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            tabIndexGetter.call(elm) === -1,
            `Invalid attempt to handle focus in  ${toString(elm)}. ${toString(
                elm
            )} should have tabIndex -1, but has tabIndex ${tabIndexGetter.call(elm)}`
        );
    }

    bindDocumentMousedownMouseupHandlers(elm);

    // Unbind any focus listeners we may have going on
    ignoreFocus(elm);

    // This focusin listener is to catch focusin events from keyboard interactions
    // A better solution would perhaps be to listen for keydown events, but
    // the keydown event happens on whatever element already has focus (or no element
    // at all in the case of the location bar. So, instead we have to assume that focusin
    // without a mousedown means keyboard navigation
    addEventListener.call(elm, 'focusin', skipShadowHandler as EventListener, true);
}

export function ignoreFocusIn(elm: HTMLElement) {
    removeEventListener.call(elm, 'focusin', skipShadowHandler as EventListener, true);
}
