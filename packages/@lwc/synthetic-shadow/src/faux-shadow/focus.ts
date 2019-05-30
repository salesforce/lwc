/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../shared/assert';
import { windowAddEventListener, windowRemoveEventListener } from '../env/window';
import {
    matches,
    querySelectorAll,
    getBoundingClientRect,
    addEventListener,
    removeEventListener,
    tabIndexGetter,
    tagNameGetter,
    hasAttribute,
    getAttribute,
} from '../env/element';
import {
    compareDocumentPosition,
    DOCUMENT_POSITION_CONTAINED_BY,
    DOCUMENT_POSITION_PRECEDING,
    DOCUMENT_POSITION_FOLLOWING,
} from '../env/node';
import {
    ArrayFind,
    ArrayIndexOf,
    ArrayReverse,
    ArraySlice,
    hasOwnProperty,
    isFalse,
    isNull,
    isUndefined,
    toString,
} from '../shared/language';
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
import { getOwnerDocument, getOwnerWindow } from '../shared/utils';

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

function isVisible(element: HTMLElement): boolean {
    const { width, height } = getBoundingClientRect.call(element);
    const noZeroSize = width > 0 || height > 0;
    return noZeroSize && getComputedStyle(element).visibility !== 'hidden';
}

function hasFocusableTabIndex(element: HTMLElement) {
    if (isFalse(hasAttribute.call(element, 'tabindex'))) {
        return false;
    }

    const value = getAttribute.call(element, 'tabindex');

    // Really, any numeric tabindex value is valid
    // But LWC only allows 0 or -1, so we can just check against that.
    // The main point here is to make sure the tabindex attribute is not an invalid
    // value like tabindex="hello"
    if (value === '' || (value !== '0' && value !== '-1')) {
        return false;
    }
    return true;
}

// This function based on https://allyjs.io/data-tables/focusable.html
// It won't catch everything, but should be good enough
// There are a lot of edge cases here that we can't realistically handle
// Determines if a particular element is tabbable, as opposed to simply focusable

// Exported for jest purposes
export function isTabbable(element: HTMLElement): boolean {
    return matches.call(element, TabbableElementsQuery) && isVisible(element);
}

const focusableTagNames = {
    IFRAME: 1,
    VIDEO: 1,
    AUDIO: 1,
    A: 1,
    INPUT: 1,
    SELECT: 1,
    TEXTAREA: 1,
    BUTTON: 1,
};

// This function based on https://allyjs.io/data-tables/focusable.html
// It won't catch everything, but should be good enough
// There are a lot of edge cases here that we can't realistically handle
// Exported for jest purposes
export function isFocusable(element: HTMLElement): boolean {
    const tagName = tagNameGetter.call(element);
    return (
        isVisible(element) &&
        (hasFocusableTabIndex(element) ||
            hasAttribute.call(element, 'contenteditable') ||
            hasOwnProperty.call(focusableTagNames, tagName))
    );
}

interface QuerySegments {
    prev: HTMLElement[];
    inner: HTMLElement[];
    next: HTMLElement[];
}

function getTabbableSegments(host: HTMLElement): QuerySegments {
    const doc = getOwnerDocument(host);
    const all = documentQuerySelectorAll.call(doc, TabbableElementsQuery);
    const inner = ArraySlice.call(querySelectorAll.call(host, TabbableElementsQuery));
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

function muteEvent(event) {
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

function keyboardFocusHandler(event: FocusEvent) {
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

// focusin handler for custom elements
// This handler should only be called when a user
// focuses on either the custom element, or an internal element
// via keyboard navigation (tab or shift+tab)
// Focusing via mouse should be disqualified before this gets called
function keyboardFocusInHandler(event: FocusEvent) {
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

function willTriggerFocusInEvent(target: HTMLElement): boolean {
    const doc = getOwnerDocument(target);
    return (
        target !== DocumentPrototypeActiveElement.call(doc) && isFocusable(target) // if the element is currently active, it will not fire a focusin event
    );
}

function enterMouseDownState(evt) {
    const currentTarget = eventCurrentTargetGetter.call(evt);
    removeEventListener.call(currentTarget, 'focusin', keyboardFocusInHandler as EventListener);
    setTimeout(() => {
        // only reinstate the focus if the tabindex is still -1
        if (!isNull(currentTarget) && tabIndexGetter.call(currentTarget as HTMLElement) === -1) {
            addEventListener.call(
                currentTarget,
                'focusin',
                keyboardFocusInHandler as EventListener
            );
        }
    }, 0);
}

function exitMouseDownState(event) {
    const currentTarget = eventCurrentTargetGetter.call(event);
    const relatedTarget = focusEventRelatedTargetGetter.call(event);
    // If the focused element is null or the focused element is no longer internal
    if (
        isNull(relatedTarget) ||
        relatedTargetPosition(currentTarget as HTMLElement, relatedTarget) !== 0
    ) {
        removeEventListener.call(currentTarget, 'focusin', enterMouseDownState, true);
        removeEventListener.call(currentTarget, 'focusout', exitMouseDownState, true);
    }
}

function handleFocusMouseDown(evt) {
    const target = eventTargetGetter.call(evt) as HTMLElement;
    // If we are mouse down in an element that can be focused
    // and the currentTarget's activeElement is not element we are mouse-ing down in
    // We can bail out and let the browser do its thing.
    if (willTriggerFocusInEvent(target)) {
        const currentTarget = eventCurrentTargetGetter.call(evt);
        // Enter the temporary state where we disable the keyboard focusin handler when we click into the shadow.
        addEventListener.call(currentTarget, 'focusin', enterMouseDownState, true);
        // Exit the temporary state When focus leaves the shadow.
        addEventListener.call(currentTarget, 'focusout', exitMouseDownState, true);
    }
}

export function handleFocus(elm: HTMLElement) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            isDelegatingFocus(elm),
            `Invalid attempt to handle focus event for ${toString(elm)}. ${toString(
                elm
            )} should have delegates focus true, but is not delegating focus`
        );
    }

    // Unbind any focusin listeners we may have going on
    ignoreFocusIn(elm);
    addEventListener.call(elm, 'focusin', keyboardFocusHandler as EventListener, true);
}

export function ignoreFocus(elm: HTMLElement) {
    removeEventListener.call(elm, 'focusin', keyboardFocusHandler as EventListener, true);
}

export function handleFocusIn(elm: HTMLElement) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            tabIndexGetter.call(elm) === -1,
            `Invalid attempt to handle focus in  ${toString(elm)}. ${toString(
                elm
            )} should have tabIndex -1, but has tabIndex ${tabIndexGetter.call(elm)}`
        );
    }

    // Unbind any focus listeners we may have going on
    ignoreFocus(elm);

    // We want to listen for mousedown
    // If the user is triggering a mousedown event on an element
    // That can trigger a focus event, then we need to opt out
    // of our tabindex -1 dance. The tabindex -1 only applies for keyboard navigation
    addEventListener.call(elm, 'mousedown', handleFocusMouseDown, true);

    // This focusin listener is to catch focusin events from keyboard interactions
    // A better solution would perhaps be to listen for keydown events, but
    // the keydown event happens on whatever element already has focus (or no element
    // at all in the case of the location bar. So, instead we have to assume that focusin
    // without a mousedown means keyboard navigation
    addEventListener.call(elm, 'focusin', keyboardFocusInHandler as EventListener);
}

export function ignoreFocusIn(elm: HTMLElement) {
    removeEventListener.call(elm, 'focusin', keyboardFocusInHandler as EventListener);
    removeEventListener.call(elm, 'mousedown', handleFocusMouseDown, true);
}
