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
    isNull,
    isUndefined,
    toString,
} from '@lwc/shared';

import { addEventListener, removeEventListener } from '../env/event-target';
import { windowAddEventListener, windowRemoveEventListener } from '../env/window';
import {
    DocumentPrototypeActiveElement,
    querySelectorAll as documentQuerySelectorAll,
} from '../env/document';
import {
    eventCurrentTargetGetter,
    eventTargetGetter,
    focusEventRelatedTargetGetter,
} from '../env/dom';
import {
    matches,
    querySelector,
    querySelectorAll,
    getBoundingClientRect,
    tabIndexGetter,
    tagNameGetter,
    getAttribute,
    hasAttribute,
} from '../env/element';
import {
    compareDocumentPosition,
    DOCUMENT_POSITION_CONTAINED_BY,
    DOCUMENT_POSITION_PRECEDING,
    DOCUMENT_POSITION_FOLLOWING,
} from '../env/node';

import { arrayFromCollection, getOwnerDocument, getOwnerWindow } from '../shared/utils';

import { isDelegatingFocus, isSyntheticShadowHost } from './shadow-root';

const FocusableSelector = `
    [contenteditable],
    [tabindex],
    a[href],
    area[href],
    audio[controls],
    button,
    iframe,
    input,
    select,
    textarea,
    video[controls]
`;

const formElementTagNames = new Set(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']);

function filterSequentiallyFocusableElements(elements: Element[]): Element[] {
    return elements.filter((element) => {
        if (hasAttribute.call(element, 'tabindex')) {
            // Even though LWC only supports tabindex values of 0 or -1,
            // passing through elements with tabindex="0" is a tighter criteria
            // than filtering out elements based on tabindex="-1".
            return getAttribute.call(element, 'tabindex') === '0';
        }
        if (formElementTagNames.has(tagNameGetter.call(element))) {
            return !hasAttribute.call(element, 'disabled');
        }
        return true;
    });
}

const DidAddMouseEventListeners = new WeakMap<any, boolean>();

// Due to browser differences, it is impossible to know what is focusable until
// we actually try to focus it. We need to refactor our focus delegation logic
// to verify whether or not the target was actually focused instead of trying
// to predict focusability like we do here.
function isVisible(element: HTMLElement): boolean {
    const { width, height } = getBoundingClientRect.call(element);
    const noZeroSize = width > 0 || height > 0;
    // The area element can be 0x0 and focusable. Hardcoding this is not ideal
    // but it will minimize changes in the current behavior.
    const isAreaElement = element.tagName === 'AREA';
    return (noZeroSize || isAreaElement) && getComputedStyle(element).visibility !== 'hidden';
}

// This function based on https://allyjs.io/data-tables/focusable.html
// It won't catch everything, but should be good enough
// There are a lot of edge cases here that we can't realistically handle
// Determines if a particular element is tabbable, as opposed to simply focusable

function isTabbable(element: HTMLElement): boolean {
    if (isSyntheticShadowHost(element) && isDelegatingFocus(element)) {
        return false;
    }
    return matches.call(element, FocusableSelector) && isVisible(element);
}

interface QuerySegments {
    prev: HTMLElement[];
    inner: HTMLElement[];
    next: HTMLElement[];
}

export function hostElementFocus(this: HTMLElement) {
    const _rootNode = this.getRootNode();
    if (_rootNode === this) {
        // We invoke the focus() method even if the host is disconnected in order to eliminate
        // observable differences for component authors between synthetic and native.
        const focusable = querySelector.call(this, FocusableSelector) as HTMLElement;
        if (!isNull(focusable)) {
            // @ts-ignore type-mismatch
            focusable.focus.apply(focusable, arguments);
        }
        return;
    }

    // If the root node is not the host element then it's either the document or a shadow root.
    const rootNode = _rootNode as unknown as DocumentOrShadowRoot;
    if (rootNode.activeElement === this) {
        // The focused element should not change if the focus method is invoked
        // on the shadow-including ancestor of the currently focused element.
        return;
    }

    const focusables = arrayFromCollection(
        querySelectorAll.call(this, FocusableSelector)
    ) as HTMLElement[];

    let didFocus = false;
    while (!didFocus && focusables.length !== 0) {
        const focusable = focusables.shift()!;
        // @ts-ignore type-mismatch
        focusable.focus.apply(focusable, arguments);
        // Get the root node of the current focusable in case it was slotted.
        const currentRootNode = focusable.getRootNode() as unknown as DocumentOrShadowRoot;
        didFocus = currentRootNode.activeElement === focusable;
    }
}

function getTabbableSegments(host: HTMLElement): QuerySegments {
    const doc = getOwnerDocument(host);
    const all = filterSequentiallyFocusableElements(
        arrayFromCollection(documentQuerySelectorAll.call(doc, FocusableSelector))
    );
    const inner = filterSequentiallyFocusableElements(
        arrayFromCollection(querySelectorAll.call(host, FocusableSelector))
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
export function isKeyboardFocusNavigationRoutineEnabled(): boolean {
    return !letBrowserHandleFocus;
}

function skipHostHandler(event: FocusEvent) {
    if (letBrowserHandleFocus) {
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

function bindDocumentMousedownMouseupHandlers(elm: HTMLElement) {
    const ownerDocument = getOwnerDocument(elm);

    if (!DidAddMouseEventListeners.get(ownerDocument)) {
        DidAddMouseEventListeners.set(ownerDocument, true);
        addEventListener.call(
            ownerDocument,
            'mousedown',
            disableKeyboardFocusNavigationRoutines,
            true
        );

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

        // [W-7824445] If the element is draggable, the mousedown event is dispatched before the
        // element is starting to be dragged, which disable the keyboard focus navigation routine.
        // But by specification, the mouseup event is never dispatched once the element is dropped.
        //
        // For all draggable element, we need to add an event listener to re-enable the keyboard
        // navigation routine after dragging starts.
        addEventListener.call(
            ownerDocument,
            'dragstart',
            enableKeyboardFocusNavigationRoutines,
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
